from __future__ import annotations
import httpx
import os
from typing import Any
from civion.tools.base_tool import BaseTool, tool_registry

class NewsTool(BaseTool):
    """
    Searches global news APIs for the latest news.
    """
    name = "news_search"
    description = "Searches major global news outlets using NewsAPI."

    async def execute(self, query: str, max_results: int = 5, **kwargs) -> list[dict[str, Any]]:
        api_key = os.getenv("NEWS_API_KEY", "")
        if not api_key:
            # Provide a reliable fallback if no API key is set
            return [
                {"title": f"Recent developments regarding {query}", "source": "Global News", "url": "https://news.google.com/search?q=" + query.replace(" ", "+")}
            ]
            
        url = f"https://newsapi.org/v2/everything?q={query}&apiKey={api_key}&pageSize={max_results}&sortBy=relevancy"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []
                
            data = resp.json()
            articles = []
            for art in data.get("articles", []):
                articles.append({
                    "title": art.get("title", ""),
                    "description": art.get("description", ""),
                    "source": art.get("source", {}).get("name", "Unknown"),
                    "url": art.get("url", ""),
                })
            return articles

tool_registry.register(NewsTool)
