from __future__ import annotations
import httpx
from typing import Any
import xml.etree.ElementTree as ET
from civion.tools.base_tool import BaseTool, tool_registry

class ArxivTool(BaseTool):
    """
    Tool for searching Arxiv research papers.
    """
    name = "arxiv_search"
    description = "Search and discover the latest scientific research papers on Arxiv."

    async def execute(self, query: str, max_results: int = 5) -> list[dict[str, Any]]:
        url = f"https://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={max_results}"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []
            
        root = ET.fromstring(resp.text)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        papers = []
        for entry in root.findall('atom:entry', ns):
            papers.append({
                "title": (entry.find('atom:title', ns).text or "").strip(),
                "summary": (entry.find('atom:summary', ns).text or "").strip()[:500] + "...",
                "published_date": entry.find('atom:published', ns).text,
                "url": entry.find('atom:id', ns).text,
            })
        return papers

tool_registry.register(ArxivTool)
