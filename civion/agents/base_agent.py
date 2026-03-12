from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone
import logging
from civion.core.constants import AgentState

log = logging.getLogger(__name__)

@dataclass
class AgentResult:
    """Result from a single agent scan cycle."""
    agent_name: str
    insights: List[Dict[str, Any]] = field(default_factory=list)
    signals: List[Dict[str, Any]] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    duration_seconds: float = 0.0
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BaseAgent(ABC):
    """Abstract base class for all agents"""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.state = AgentState.STOPPED
        self._running = False
        self._scan_count = 0
        self.logger = log
    
    @property
    def is_running(self) -> bool:
        return self._running

    async def start(self):
        self._running = True
        self.state = AgentState.IDLE
        log.info(f"Agent {self.name} started")

    async def stop(self):
        self._running = False
        self.state = AgentState.STOPPED
        log.info(f"Agent {self.name} stopped")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "status": self.state.value if hasattr(self.state, 'value') else self.state,
            "is_running": self.is_running,
            "last_active": datetime.now(timezone.utc).isoformat(),
            "signals_found": getattr(self, "signals_found", 0),
            "current_task": "Idle",
            "uptime_seconds": 0
        }

    async def run_cycle(self) -> AgentResult:
        """Run one full scan and analysis cycle."""
        start_time = datetime.now()
        self.state = AgentState.SCANNING
        self._scan_count += 1
        
        try:
            # Most subclasses override scan() or analyze()
            # This is a generic implementation to satisfy basic tests
            if hasattr(self, 'scan'):
                raw = await self.scan()
                # If scan returns data, treat it as insights for basic agents
                insights = raw if isinstance(raw, list) else [raw] if raw else []
            else:
                raw = []
                insights = []
                
            self.state = AgentState.ANALYZING
            
            if hasattr(self, 'analyze_raw'):
                result = await self.analyze_raw(raw)
                if isinstance(result, dict):
                    result = AgentResult(agent_name=self.name, **result)
                return result
            
            # Fallback
            duration = (datetime.now() - start_time).total_seconds()
            return AgentResult(
                agent_name=self.name, 
                insights=insights, 
                duration_seconds=duration
            )
            
        except Exception as e:
            self.state = AgentState.ERROR
            log.error(f"Error in {self.name} cycle: {str(e)}")
            return AgentResult(agent_name=self.name, errors=[str(e)])
        finally:
            if self._running:
                self.state = AgentState.IDLE

    @abstractmethod
    async def analyze(self, topic: str) -> Dict[str, Any]:
        """
        Analyze topic and return structured result.
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
        
        log.info(f"Requesting LLM analysis for {context}...")
        response = await llm_service.complete(prompt)
        log.info(f"Received LLM analysis for {context} ({len(response)} chars)")
        return response
