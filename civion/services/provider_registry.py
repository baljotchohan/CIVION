"""
CIVION Provider Registry
Metadata and configuration for all supported LLM providers.
"""

PROVIDERS = {
    "anthropic": {
        "name": "Anthropic Claude",
        "models": ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
        "env_key": "ANTHROPIC_API_KEY",
        "get_key_url": "https://console.anthropic.com",
        "requires_key": True,
        "cost_tier": "medium-high",
        "description": "Best for reasoning, analysis and high-quality output.",
        "install_package": "anthropic"
    },
    "openai": {
        "name": "OpenAI",
        "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1-preview", "o1-mini"],
        "env_key": "OPENAI_API_KEY",
        "get_key_url": "https://platform.openai.com/api-keys",
        "requires_key": True,
        "cost_tier": "medium",
        "description": "General purpose models with great speed and capability.",
        "install_package": "openai"
    },
    "gemini": {
        "name": "Google Gemini",
        "models": ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
        "env_key": "GOOGLE_API_KEY",
        "get_key_url": "https://aistudio.google.com/app/apikey",
        "requires_key": True,
        "cost_tier": "low-medium",
        "description": "Large context window and multimodal capabilities.",
        "install_package": "google-generativeai"
    },
    "mistral": {
        "name": "Mistral",
        "models": ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "codestral-latest"],
        "env_key": "MISTRAL_API_KEY",
        "get_key_url": "https://console.mistral.ai",
        "requires_key": True,
        "cost_tier": "low",
        "description": "Excellent performance-to-cost ratio, great for code.",
        "install_package": "mistralai"
    },
    "groq": {
        "name": "Groq",
        "models": ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
        "env_key": "GROQ_API_KEY",
        "get_key_url": "https://console.groq.com",
        "requires_key": True,
        "cost_tier": "very low",
        "description": "Ultra-fast inference for real-time applications.",
        "install_package": "groq"
    },
    "cohere": {
        "name": "Cohere",
        "models": ["command-r-plus", "command-r", "command"],
        "env_key": "COHERE_API_KEY",
        "get_key_url": "https://dashboard.cohere.com",
        "requires_key": True,
        "cost_tier": "low",
        "description": "Optimized for enterprise search and RAG applications.",
        "install_package": "cohere"
    },
    "together": {
        "name": "Together AI",
        "models": ["meta-llama/Llama-3-70b-chat-hf", "mistralai/Mixtral-8x22B-Instruct-v0.1", "NousResearch/Nous-Hermes-2-Yi-34B"],
        "env_key": "TOGETHER_API_KEY",
        "get_key_url": "https://api.together.xyz",
        "requires_key": True,
        "cost_tier": "very low",
        "description": "Access to the best open-source models.",
        "install_package": "together"
    },
    "perplexity": {
        "name": "Perplexity",
        "models": ["llama-3.1-sonar-large-128k-online", "llama-3.1-sonar-small-128k-online"],
        "env_key": "PERPLEXITY_API_KEY",
        "get_key_url": "https://www.perplexity.ai/settings/api",
        "requires_key": True,
        "cost_tier": "low",
        "description": "Real-time web search and information retrieval.",
        "install_package": "openai"
    },
    "ollama": {
        "name": "Ollama (Local)",
        "models": ["llama3.2", "mistral", "codellama", "phi3", "gemma2", "qwen2.5"],
        "env_key": None,
        "get_key_url": "https://ollama.ai",
        "requires_key": False,
        "cost_tier": "free",
        "description": "Run AI models locally on your machine for 100% privacy.",
        "install_package": "ollama"
    },
    "azure": {
        "name": "Azure OpenAI",
        "models": [],
        "env_key": "AZURE_OPENAI_API_KEY",
        "get_key_url": "https://portal.azure.com",
        "requires_key": True,
        "requires_endpoint": True,
        "cost_tier": "enterprise",
        "description": "Enterprise-grade deployments of OpenAI models.",
        "install_package": "openai"
    },
    "bedrock": {
        "name": "AWS Bedrock",
        "models": ["anthropic.claude-3-5-sonnet", "meta.llama3-70b-instruct", "amazon.titan-text-express"],
        "env_key": None,
        "requires_key": False,
        "cost_tier": "pay-per-use",
        "description": "Fully managed models on AWS infrastructure.",
        "install_package": "boto3"
    },
    "huggingface": {
        "name": "Hugging Face",
        "models": [],
        "env_key": "HUGGINGFACE_API_KEY",
        "get_key_url": "https://huggingface.co/settings/tokens",
        "requires_key": True,
        "cost_tier": "free-tier",
        "description": "Access to thousands of research models.",
        "install_package": "huggingface-hub"
    }
}
