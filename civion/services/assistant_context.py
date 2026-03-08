import time

class AssistantContextBuilder:
    """Builds rich context for ARIA from all app systems"""
    
    async def get_health(self):
        try:
            from civion.api.routes.system import get_system_health
            return get_system_health()["health"]
        except Exception:
            return "unknown"
        
    async def get_active_agents(self):
        return ["github", "market"] # mock

    async def get_recent_signals(self, limit=5):
        return [] # mock

    async def get_predictions(self, limit=3):
        return [] # mock

    async def get_active_goals(self):
        return []

    async def get_confidence_avg(self):
        return 0.85

    async def get_peer_count(self):
        return 12

    def get_uptime(self):
        try:
            from civion.api.routes.system import SYSTEM_START_TIME
            return f"{int(time.time() - SYSTEM_START_TIME)}s"
        except Exception:
            return "0s"
        
    async def get_recent_debates(self, limit=2):
        return []

    async def get_key_status(self):
        try:
            from civion.api.routes.system import _config_store
            return _config_store["api_keys"]
        except Exception:
            return {}

    async def build_context(self) -> dict:
        return {
            "system_health": await self.get_health(),
            "active_agents": await self.get_active_agents(),
            "recent_signals": await self.get_recent_signals(limit=5),
            "recent_predictions": await self.get_predictions(limit=3),
            "current_goals": await self.get_active_goals(),
            "confidence_avg": await self.get_confidence_avg(),
            "network_peers": await self.get_peer_count(),
            "uptime": self.get_uptime(),
            "recent_debates": await self.get_recent_debates(limit=2),
            "api_keys_configured": await self.get_key_status(),
        }
  
    def build_system_prompt(self, context: dict) -> str:
        return f"""
You are ARIA (Adaptive Reasoning Intelligence Assistant), 
the built-in AI assistant for CIVION v2.

You have access to the following real-time data:
- System health: {context.get('system_health')}
- Active agents: {context.get('active_agents')}
- Recent signals: {context.get('recent_signals')}  
- Recent predictions: {context.get('recent_predictions')}
- Network peers: {context.get('network_peers')}
- Uptime: {context.get('uptime')}

You can help users with:
1. Understanding what CIVION is and how it works
2. Explaining current agent activities
3. Interpreting signals and predictions
4. Executing commands (start/stop agents, create goals)
5. Explaining confidence scores and debates
6. Troubleshooting issues

When a user wants to take an action, respond with JSON actions ONLY:
{{"actions": [{{"type": "start_agent", "agent_id": "github"}}]}}

Available action types:
- start_agent: {{ agent_id: string }}
- stop_agent: {{ agent_id: string }}
- create_goal: {{ title: string }}
- navigate: {{ page: string }}
- open_settings: {{}}

Personality: Helpful, precise, slightly futuristic. 
Use technical language but explain clearly.
Keep responses concise unless asked for detail.
Never make up data — only use what's provided in context.
"""
