from __future__ import annotations
import httpx
from typing import Any
from civion.tools.base_tool import BaseTool, tool_registry
import asyncio

class HackerNewsTool(BaseTool):
    """
    Searches HackerNews for the top stories.
    """
    name = "hackernews_search"
    description = "Retrieves top tech and startup news from HackerNews."

    async def execute(self, max_results: int = 5, **kwargs) -> list[dict[str, Any]]:
        url = "https://hacker-news.firebaseio.com/v0/topstories.json"
        
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []
                
            story_ids = resp.json()[:max_results]
            stories = []
            
            async def fetch_story(sid):
                s_resp = await client.get(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json")
                if s_resp.status_code == 200:
                    data = s_resp.json()
                    if data:
                        return {
                            "title": data.get("title", ""),
                            "url": data.get("url", f"https://news.ycombinator.com/item?id={sid}"),
                            "score": data.get("score", 0),
                            "author": data.get("by", ""),
                        }
                return None
                
            results = await asyncio.gather(*(fetch_story(sid) for sid in story_ids))
            return [r for r in results if r]

tool_registry.register(HackerNewsTool)
