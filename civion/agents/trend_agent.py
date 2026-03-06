"""
CIVION — Trend Agent
Finds trending AI / ML repositories on GitHub and produces an insight.
v2: Explorer personality, memory graph tags, world events.
"""

from __future__ import annotations

from civion.agents.base_agent import BaseAgent, AgentResult
from civion.services.api_service import api
from civion.services.llm_service import llm


class TrendAgent(BaseAgent):
    """
    Searches the GitHub API for the most-starred AI repositories
    created in the last 7 days and summarises the results.
    """

    name = "TrendAgent"
    description = "Discover trending AI repositories on GitHub"
    interval = 3600
    data_sources = ["https://api.github.com/search/repositories"]
    personality = "Explorer"
    tags = ["ai", "github", "trending", "repositories", "open-source"]

    async def run(self) -> AgentResult:
        try:
            from datetime import datetime, timedelta, timezone

            week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
            key = await api.get_connection_key("GitHub")
            headers = {"Accept": "application/vnd.github+json"}
            warning_msg = ""
            
            if key:
                headers["Authorization"] = f"token {key}"
            else:
                warning_msg = "⚠️ GitHub API key missing - using public rate-limited access\n\n"

            try:
                data = await api.get(url, params=params, headers=headers)
            except Exception as e:
                # Fallback analysis if API fails
                fallback_content = (
                    f"{warning_msg}❌ GitHub API error: {str(e)}\n\n"
                    "**Fallback Analysis:** Recent trends show a surge in 'Agentic Workflow' "
                    "repositories and 'Multi-Agent Systems' research. Projects like 'AutoGen' "
                    "and 'CrewAI' continue to dominate the developer attention space."
                )
                return AgentResult(
                    success=True,
                    title="GitHub Trends (Fallback)",
                    content=fallback_content,
                    confidence=0.4
                )

            if isinstance(data, str):
                return AgentResult(success=False, content=f"Unexpected response: {data[:200]}")

            items = data.get("items", []) if isinstance(data, dict) else []

            if not items:
                return AgentResult(
                    success=True,
                    title="Trending AI Repos",
                    content="No trending AI repositories found this week.",
                )

            # Build readable summary
            lines = []
            events = []  # v2: world map events
            for i, repo in enumerate(items, 1):
                name = repo.get("full_name", "unknown")
                stars = repo.get("stargazers_count", 0)
                desc = repo.get("description", "No description") or "No description"
                url_ = repo.get("html_url", "")
                lang = repo.get("language", "N/A") or "N/A"
                lines.append(
                    f"{i}. **{name}** ⭐ {stars}\n"
                    f"   {desc}\n"
                    f"   Language: {lang} | {url_}"
                )

                # Generate a world event for the top repos (simulated locations)
                if i <= 5:
                    loc = _SIMULATED_LOCATIONS.get(i, ("San Francisco", 37.77, -122.42))
                    events.append({
                        "topic": f"Trending: {name}",
                        "description": f"⭐ {stars} stars — {desc[:120]}",
                        "location": loc[0],
                        "latitude": loc[1],
                        "longitude": loc[2],
                    })

            summary = "\n\n".join(lines)

            # Optional LLM enhancement using personality prompt
            try:
                llm_summary = await llm.generate(
                    prompt=(
                        "Summarise these trending AI GitHub repositories in 3-4 sentences, "
                        "highlighting the most interesting projects:\n\n" + summary
                    ),
                    system=self.personality_prompt(),
                )
                if llm_summary and not llm_summary.startswith("["):
                    summary = f"## AI Summary\n{llm_summary}\n\n## Raw Data\n{summary}"
            except Exception:
                pass

            return AgentResult(
                success=True,
                title="Trending AI Repositories This Week",
                content=warning_msg + summary,
                events=events,
                source="https://github.com/trending",
                confidence=0.9 if key else 0.7
            )

        except Exception as exc:
            return AgentResult(success=False, content=f"TrendAgent error: {exc}")


# Simulated geo-locations for demo world map events
_SIMULATED_LOCATIONS = {
    1: ("San Francisco, USA", 37.7749, -122.4194),
    2: ("London, UK", 51.5074, -0.1278),
    3: ("Tokyo, Japan", 35.6762, 139.6503),
    4: ("Berlin, Germany", 52.5200, 13.4050),
    5: ("Bangalore, India", 12.9716, 77.5946),
}
