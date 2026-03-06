from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Dict, Type
import logging

logger = logging.getLogger("civion.tools")

class BaseTool(ABC):
    """
    Abstract base class for all CIVION tools.
    
    Tools are modular capabilities that agents can use to interact
    with the external world.
    """
    
    name: str = ""
    description: str = ""
    
    def __init__(self, agent_context: Any = None):
        """
        Initialize the tool with optional agent context.
        context can provide access to agent memory, sandbox, etc.
        """
        self.context = agent_context

    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        """
        Execute the tool with the given parameters.
        Returns the result of the tool execution.
        """
        pass

    def info(self) -> Dict[str, str]:
        """Return metadata about the tool."""
        return {
            "name": self.name,
            "description": self.description
        }

class ToolRegistry:
    """
    Registry for managing available tools.
    """
    _instance = None
    _tools: Dict[str, Type[BaseTool]] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ToolRegistry, cls).__new__(cls)
        return cls._instance

    @classmethod
    def register(cls, tool_class: Type[BaseTool]):
        """Register a tool class in the registry."""
        if not tool_class.name:
            raise ValueError(f"Tool class {tool_class.__name__} must have a name.")
        cls._tools[tool_class.name] = tool_class
        logger.info(f"Registered tool: {tool_class.name}")

    @classmethod
    def get_tool(cls, name: str, context: Any = None) -> BaseTool | None:
        """Get an instance of a tool by name."""
        tool_class = cls._tools.get(name)
        if tool_class:
            return tool_class(agent_context=context)
        return None

    @classmethod
    def list_tools(cls) -> list[Dict[str, str]]:
        """List all registered tools."""
        return [{"name": t.name, "description": t.description} for t in cls._tools.values()]

# Global registry instance
tool_registry = ToolRegistry()
