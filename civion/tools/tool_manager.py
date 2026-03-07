"""
CIVION Tool Manager
Registry and orchestration for all data source tools.
"""
from __future__ import annotations
from typing import Dict, List, Any, Optional
from civion.tools.base_tool import BaseTool
from civion.core.logger import get_logger

log = get_logger("tool_manager")


class ToolManager:
    """Central registry for all tools."""

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        """Register a tool."""
        self._tools[tool.name] = tool
        log.info(f"Registered tool: {tool.name}")

    def get(self, name: str) -> Optional[BaseTool]:
        """Get a tool by name."""
        return self._tools.get(name)

    async def execute(self, name: str, **kwargs) -> Dict[str, Any]:
        """Execute a tool by name."""
        tool = self._tools.get(name)
        if not tool:
            return {"error": f"Tool '{name}' not found"}
        return await tool(**kwargs)

    def list_tools(self) -> List[Dict[str, Any]]:
        """List all registered tools."""
        return [tool.to_dict() for tool in self._tools.values()]

    @property
    def tool_names(self) -> List[str]:
        return list(self._tools.keys())


# Singleton
tool_manager = ToolManager()
