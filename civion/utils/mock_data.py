import uuid
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

class MockDataGenerator:
    """Generates mock data for frontend testing and UI demonstration."""
    
    @staticmethod
    def now_str() -> str:
        return datetime.now().isoformat()
        
    @staticmethod
    def past_time(minutes: int) -> str:
        return (datetime.now() - timedelta(minutes=minutes)).isoformat()

    @classmethod
    def generate_debate(cls) -> List[Dict[str, Any]]:
        agents = [
            {"name": "Research Monitor", "role": "proposer"},
            {"name": "Market Signal", "role": "challenger"},
            {"name": "GitHub Trend", "role": "verifier"},
            {"name": "Sentiment Engine", "role": "synthesizer"}
        ]
        
        script = [
            (0, "I propose an emerging trend: AI coding agents are shifting from auto-complete to autonomous systems faster than anticipated.", 0.85, False),
            (1, "The investment data doesn't fully support a complete shift yet; enterprise adoption is still focused on copilot models due to security concerns.", 0.65, False),
            (2, "Actually, looking at GitHub repo activity, fully autonomous agent frameworks (like LangChain, AutoGPT forks) have 3x the fork velocity of standard LLM wrappers this month.", 0.90, False),
            (3, "Synthesizing the signals: The developer enthusiasm (GitHub) outpaces enterprise adoption (Market). The trend is real but currently constrained to early adopters and SMBs.", 0.88, True)
        ]
        
        debate = []
        for i, (agent_idx, content, conf, final) in enumerate(script):
            agent = agents[agent_idx]
            debate.append({
                "id": str(uuid.uuid4()),
                "agent_name": agent["name"],
                "role": agent["role"],
                "content": content,
                "confidence": conf,
                "timestamp": cls.past_time(10 - i*2),
                "is_final": final
            })
            
        return debate

    @classmethod
    def generate_confidence_history(cls) -> List[Dict[str, Any]]:
        """Fake confidence steps for the ConfidenceCascade."""
        steps = [
            ("Research Monitor", "verified", "Found strong academic evidence (+150% papers)", 0.20, 0.45),
            ("GitHub Trend", "verified", "Spike in related open source projects", 0.45, 0.65),
            ("Market Signal", "challenged", "Q1 funding is actually down 10%", 0.65, 0.55),
            ("Sentiment Engine", "confirmed", "Developer sentiment overwhelmingly positive", 0.55, 0.82)
        ]
        
        history = []
        for i, (agent, action, reason, before, after) in enumerate(steps):
            history.append({
                "agent": agent,
                "action": action,
                "confidence_before": before,
                "confidence_after": after,
                "timestamp": cls.past_time(15 - i*3),
                "reason": reason
            })
            
        return history

    @classmethod
    def generate_predictions(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": str(uuid.uuid4()),
                "title": "Autonomous AI Engineering Reality",
                "description": "True autonomous agentic coding frameworks will replace 40% of standard copilot usage by end of year.",
                "probability": 0.82,
                "timeframe": "8 months",
                "evidence": ["GitHub activity", "Developer sentiment", "Research papers"],
                "created_at": cls.past_time(120),
                "resolved": False,
                "outcome": None,
                "accuracy": None,
                "shared_count": 134
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Quantum Error Correction Break",
                "description": "Major breakthrough in logical qubits stabilizing beyond previous limits.",
                "probability": 0.45,
                "timeframe": "12 months",
                "evidence": ["ArXiv papers", "University press"],
                "created_at": cls.past_time(300),
                "resolved": True,
                "outcome": False,
                "accuracy": 0.3,
                "shared_count": 89
            }
        ]

    @classmethod
    def generate_signals(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": str(uuid.uuid4()),
                "source": "GitHub",
                "title": "Spike in rust-based AI frameworks",
                "confidence": 0.95,
                "timestamp": cls.past_time(2),
                "strength": 0.88,
                "signal_type": "code_trend"
            },
            {
                "id": str(uuid.uuid4()),
                "source": "ArXiv",
                "title": "New alignment technique proposed",
                "confidence": 0.70,
                "timestamp": cls.past_time(14),
                "strength": 0.65,
                "signal_type": "research"
            }
        ]

    @classmethod
    def generate_peers(cls) -> List[Dict[str, Any]]:
        return [
            {"id": str(uuid.uuid4()), "location": "US-East", "findings_count": 145, "status": "active", "latency": 45},
            {"id": str(uuid.uuid4()), "location": "EU-Central", "findings_count": 89, "status": "active", "latency": 110},
            {"id": str(uuid.uuid4()), "location": "AP-South", "findings_count": 234, "status": "active", "latency": 180},
            {"id": str(uuid.uuid4()), "location": "US-West", "findings_count": 56, "status": "syncing", "latency": 60}
        ]
