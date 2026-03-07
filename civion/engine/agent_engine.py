"""
CIVION — Agent Engine (V2 Backward Compatibility)
Redirects 'engine' to the new 'agent_controller.py' AgentController instance.
"""

from civion.engine.agent_controller import AgentController, agent_controller as engine
