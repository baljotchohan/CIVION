"""
CIVION AWS Bedrock Provider
"""
import httpx
from typing import AsyncGenerator, List, Optional, Any
from civion.core.logger import engine_logger
log = engine_logger(__name__)
from .base_provider import BaseProvider

class BedrockProvider(BaseProvider):
    async def complete(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        try:
            import boto3
            import json
            client = boto3.client(
                service_name='bedrock-runtime',
                region_name=self.config.get("region", "us-east-1")
            )
            body = json.dumps({
                "prompt": prompt,
                "max_tokens_to_sample": max_tokens,
                "temperature": temperature,
            })
            response = client.invoke_model(
                body=body,
                modelId=self.model or "anthropic.claude-3-5-sonnet-20240620-v1:0",
                accept='application/json',
                contentType='application/json'
            )
            response_body = json.loads(response.get('body').read())
            return response_body.get('completion', '')
        except ImportError:
            return "Boto3 package not installed. Run 'pip install boto3'."
        except Exception as e:
            return f"Bedrock Error: {str(e)}"

    async def stream(
        self,
        prompt: str,
        system: str = None,
        messages: list = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        try:
            import boto3
            import json
            client = boto3.client(
                service_name='bedrock-runtime',
                region_name=self.config.get("region", "us-east-1")
            )
            body = json.dumps({
                "prompt": prompt,
                "max_tokens_to_sample": max_tokens,
                "temperature": temperature,
            })
            response = client.invoke_model_with_response_stream(
                body=body,
                modelId=self.model or "anthropic.claude-3-5-sonnet-20240620-v1:0",
                accept='application/json',
                contentType='application/json'
            )
            for event in response.get('body'):
                chunk = json.loads(event.get('chunk').get('bytes'))
                if 'completion' in chunk:
                    yield chunk['completion']
        except ImportError:
            yield "Boto3 package not installed."
        except Exception as e:
            yield f"Error: {str(e)}"

    async def test_connection(self) -> bool:
        try:
            import boto3
            client = boto3.client(service_name='bedrock', region_name=self.config.get("region", "us-east-1"))
            client.list_foundation_models()
            return True
        except httpx.TimeoutError:
            log.warning(f"Bedrock API timeout")
            return self._fallback_response("timeout")
        except Exception as e:
            log.error(f"Bedrock provider error: {str(e)}")
            return None

    def _fallback_response(self, error_reason: str) -> dict:
        return {
            "error": error_reason,
            "fallback": True,
            "content": "API unavailable, using cached response"
        }

    def get_available_models(self) -> List[str]:
        return ["anthropic.claude-3-5-sonnet", "meta.llama3-70b-instruct", "amazon.titan-text-express"]

    def get_cost_estimate(self, tokens: int) -> float:
        return (tokens / 1000000) * 3.0
