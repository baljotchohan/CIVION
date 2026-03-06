from __future__ import annotations
from typing import Any
from civion.tools.base_tool import BaseTool, tool_registry
from civion.services.api_service import api

class WebSearchTool(BaseTool):
    """
    Tool for searching the internet using DuckDuckGo.
    """
    name = "web_search"
    description = "Search the internet for real-time information and latest updates."

    async def execute(self, query: str) -> Any:
        """
        Search the web for the given query.
        """
        # Using a simple duckduckgo api endpoint or a proxy if available
        # For now, we use a general search pattern that the APIService can handle/mock
        url = f"https://api.duckduckgo.com/?q={query}&format=json"
        return await api.get(url)

tool_registry.register(WebSearchTool)
