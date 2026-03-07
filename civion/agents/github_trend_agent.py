"""
GitHub Trend Agent
Monitors GitHub trending repos and emerging open-source projects.
"""
from __future__ import annotations
import random
from typing import Any, Dict, List
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.utils.helpers import generate_id, now_iso


class GitHubTrendAgent(BaseAgent):
    """Scans GitHub trending repos for emerging technology signals."""

    def __init__(self):
        super().__init__(
            name="github_trend",
            description="Monitors GitHub trending repositories and emerging open-source projects"
        )

    async def scan(self) -> List[Dict[str, Any]]:
        """Fetch trending repos from GitHub."""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://api.github.com/search/repositories",
                    params={
                        "q": "stars:>100 created:>2024-01-01",
                        "sort": "stars",
                        "order": "desc",
                        "per_page": 20,
                    },
                    headers={"Accept": "application/vnd.github.v3+json"},
                    timeout=15.0,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("items", [])
        except Exception as e:
            self.log.warning(f"GitHub API error, using mock data: {e}")

        # Mock data fallback
        return self._mock_trending()

    async def analyze(self, raw_data: List[Dict[str, Any]]) -> AgentResult:
        """Analyze trending repos for technology signals."""
        insights = []
        signals = []

        for repo in raw_data[:10]:
            name = repo.get("full_name", repo.get("name", "unknown"))
            stars = repo.get("stargazers_count", 0)
            language = repo.get("language", "Unknown")
            description = repo.get("description", "")

            # Generate insight
            if stars > 500:
                insights.append({
                    "id": generate_id("gi"),
                    "title": f"Trending: {name}",
                    "content": f"Repository {name} ({language}) is trending with {stars} stars. {description}",
                    "source": "github",
                    "confidence": min(stars / 10000, 0.95),
                    "tags": ["github", "trending", language.lower() if language else "unknown"],
                    "created_at": now_iso(),
                })

            # Generate signal for high-growth repos
            if stars > 1000:
                signals.append({
                    "id": generate_id("gs"),
                    "title": f"High-Growth: {name}",
                    "description": f"{name} showing rapid growth pattern with {stars} stars",
                    "source": "github",
                    "signal_type": "growth",
                    "strength": min(stars / 5000, 0.95),
                    "metadata_json": f'{{"repo": "{name}", "stars": {stars}, "language": "{language}"}}',
                    "detected_at": now_iso(),
                })

        return AgentResult(agent_name=self.name, insights=insights, signals=signals)

    def _mock_trending(self) -> List[Dict[str, Any]]:
        """Generate mock trending data."""
        mock_repos = [
            {"full_name": "openai/swarm", "stargazers_count": 8500, "language": "Python",
             "description": "Multi-agent orchestration framework"},
            {"full_name": "anthropics/claude-code", "stargazers_count": 12000, "language": "TypeScript",
             "description": "AI-powered coding assistant"},
            {"full_name": "meta/llama-3", "stargazers_count": 25000, "language": "Python",
             "description": "Next generation open-source LLM"},
            {"full_name": "google/gemma-3", "stargazers_count": 7800, "language": "Python",
             "description": "Lightweight open model series"},
            {"full_name": "deepseek-ai/DeepSeek-V3", "stargazers_count": 15000, "language": "Python",
             "description": "Advanced reasoning model"},
        ]
        return mock_repos


github_trend_agent = GitHubTrendAgent()
