"""
CIVION Exceptions
Custom exception hierarchy.
"""


class CivionError(Exception):
    """Base exception for all CIVION errors."""
    pass


class AgentError(CivionError):
    """Error in agent execution."""
    def __init__(self, agent_name: str, message: str):
        self.agent_name = agent_name
        super().__init__(f"Agent '{agent_name}': {message}")


class ToolError(CivionError):
    """Error in tool execution."""
    def __init__(self, tool_name: str, message: str):
        self.tool_name = tool_name
        super().__init__(f"Tool '{tool_name}': {message}")


class LLMError(CivionError):
    """Error communicating with LLM provider."""
    def __init__(self, provider: str, message: str):
        self.provider = provider
        super().__init__(f"LLM '{provider}': {message}")


class GoalError(CivionError):
    """Error in goal processing."""
    pass


class NetworkError(CivionError):
    """Error in P2P network operations."""
    pass


class ConfigError(CivionError):
    """Configuration error."""
    pass


class StorageError(CivionError):
    """Database or storage error."""
    pass
