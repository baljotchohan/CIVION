"""Base agent class for all agents"""
from abc import ABC, abstractmethod
from typing import Any, Dict
import logging

log = logging.getLogger(__name__)

class BaseAgent(ABC):
    """Abstract base class for all agents"""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = log
    
    @abstractmethod
    async def analyze(self, topic: str) -> Dict[str, Any]:
        """
        Analyze topic and return structured result.
        
        Must return:
        {
            "agent": str (agent name),
            "analysis": str (LLM analysis),
            "confidence": float (0-1),
            "data": dict (raw data),
            "position": str ("support" | "challenge")
        }
        """
        pass
    
    async def _get_llm_analysis(self, context: str, data_summary: str) -> str:
        """Use LLM to synthesize data into analysis"""
        from civion.services.llm_service import llm_service
        
        prompt = f"""
        Analyze this {context}:
        
        {data_summary}
        
        Provide a 2-3 sentence analysis of key findings and trends.
        """
        
        response = await llm_service.complete(prompt)
        return response
