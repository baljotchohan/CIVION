from __future__ import annotations
from typing import Any
from civion.tools.base_tool import BaseTool, tool_registry
from civion.services.api_service import api

class ArxivTool(BaseTool):
    """
    Tool for searching Arxiv research papers.
    """
    name = "arxiv"
    description = "Search and discover the latest scientific research papers on Arxiv."

    async def execute(self, query: str, max_results: int = 5) -> Any:
        """
        Search Arxiv for papers.
        """
        url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={max_results}"
        return await api.get(url, raw=True) # Arxiv returns XML

tool_registry.register(ArxivTool)
