from __future__ import annotations
from typing import Any
from civion.tools.base_tool import BaseTool, tool_registry
from civion.services.api_service import api

class GitHubTool(BaseTool):
    """
    Tool for interacting with GitHub API.
    """
    name = "github"
    description = "Analyze GitHub repositories, trends, and user activity."

    async def execute(self, action: str, **kwargs) -> Any:
        """
        GitHub actions:
          search_repos: query (str)
          get_trending: language (str)
        """
        api_key = await api.get_connection_key("github")
        headers = {"Authorization": f"token {api_key}"} if api_key else {}
        
        if action == "search_repos":
            query = kwargs.get("query", "")
            url = f"https://api.github.com/search/repositories?q={query}"
            return await api.get(url, headers=headers)
        elif action == "get_trending":
            # Simplified trending via search
            lang = kwargs.get("language", "python")
            url = f"https://api.github.com/search/repositories?q=language:{lang}&sort=stars&order=desc"
            return await api.get(url, headers=headers)
        else:
            raise ValueError(f"Unknown action: {action}")

tool_registry.register(GitHubTool)
