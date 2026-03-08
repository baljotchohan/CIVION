import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict

def generate_mock_signal() -> Dict:
    sources = ['github', 'arxiv', 'market', 'security', 'news', 'network']
    signal_types = ['repo_update', 'paper_published', 'price_movement', 'vulnerability', 'news_alert']
    
    return {
        "id": f"sig_{random.randint(1000, 9999)}",
        "source": random.choice(sources),
        "title": f"New {random.choice(signal_types)} detected",
        "description": "Automated simulated signal analysis suggests moderate impact.",
        "confidence": round(random.uniform(0.5, 0.99), 2),
        "strength": round(random.uniform(0.1, 1.0), 2),
        "signal_type": random.choice(signal_types),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "evidence": [f"Data point {random.randint(1,10)}", f"Reference link {random.randint(1,5)}"],
        "tags": [random.choice(["ai", "crypto", "security", "market"])],
        "url": f"https://civion.network/sig/{random.randint(100,999)}"
    }

def generate_mock_agent(agent_id: str = None) -> Dict:
    roles = ['Research', 'Analysis', 'Security', 'Trading']
    statuses = ['running', 'stopped', 'error', 'paused']
    
    return {
        "id": agent_id or f"agt_{random.randint(100, 999)}",
        "name": f"{random.choice(roles)} Agent Alpha",
        "type": random.choice(["Collector", "Analyzer", "Synthesizer"]),
        "status": random.choice(statuses),
        "last_active": datetime.utcnow().isoformat() + "Z",
        "signals_found": random.randint(10, 500),
        "current_task": "Monitoring data streams...",
        "uptime_seconds": random.randint(300, 86400),
        "error_message": None if random.random() > 0.1 else "Connection timeout in secondary thread"
    }

def generate_mock_prediction() -> Dict:
    return {
        "id": f"pred_{random.randint(1000, 9999)}",
        "title": "Quantum compute breakthrough expected",
        "description": "Signals indicate major leap in quantum error correction.",
        "probability": round(random.uniform(0.6, 0.95), 2),
        "timeframe": "Next 6 months",
        "evidence": ["Arxiv paper volume doubling", "Github repo activity surge"],
        "created_at": datetime.utcnow().isoformat() + "Z",
        "resolved": False,
        "outcome": None,
        "accuracy": None,
        "shared_count": random.randint(0, 100),
        "tags": ["quantum", "tech", "forecast"]
    }

def generate_mock_persona() -> Dict:
    return {
        "id": f"per_{random.randint(100, 999)}",
        "name": "Sec-Ops Guardian",
        "description": "Strict security-focused analytical profile.",
        "analysis_style": "critical",
        "topics": ["security", "vulnerabilities", "infrastructure"],
        "sample_analysis": "This repo contains 3 critical CVEs.",
        "usage_count": random.randint(5, 50),
        "created_at": datetime.utcnow().isoformat() + "Z",
        "color": "#ff006e",
        "emoji": "🛡️",
        "is_shared": True
    }

def generate_mock_peer() -> Dict:
    return {
        "id": f"peer_{random.randint(1000, 9999)}",
        "name": f"Node-{random.randint(10, 99)}",
        "location": random.choice(["US-East", "EU-West", "AP-South"]),
        "lat": round(random.uniform(-90, 90), 2),
        "lng": round(random.uniform(-180, 180), 2),
        "findings_count": random.randint(10, 1000),
        "reputation": random.randint(60, 100),
        "last_seen": datetime.utcnow().isoformat() + "Z",
        "shared_signals": random.randint(0, 50)
    }

def generate_mock_debate_message(role: str) -> Dict:
    return {
        "id": f"msg_{random.randint(1000, 9999)}",
        "agent_name": f"{role.capitalize()} Alpha",
        "role": role,
        "content": f"Analyzing from {role} perspective. Evidence suggests high validity.",
        "confidence": round(random.uniform(0.4, 0.95), 2),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "is_final": False
    }

def generate_mock_confidence_step() -> Dict:
    actions = ['verified', 'challenged', 'confirmed', 'verifying', 'rejected']
    return {
        "agent": f"Agent {random.randint(1,5)}",
        "action": random.choice(actions),
        "confidence_before": round(random.uniform(0.4, 0.8), 2),
        "confidence_after": round(random.uniform(0.5, 0.95), 2),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "reason": "Corroborated via secondary signal stream"
    }
