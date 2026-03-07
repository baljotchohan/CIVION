"""
Startup Radar Agent
Monitors HackerNews for emerging startups and tech trends.
"""
from __future__ import annotations
import random
from typing import Any, Dict, List
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.utils.helpers import generate_id, now_iso


class StartupRadarAgent(BaseAgent):
    """Scans HackerNews for startup signals and tech trends."""

    def __init__(self):
        super().__init__(
            name="startup_radar",
            description="Monitors HackerNews for emerging startups and technology trends"
        )

    async def scan(self) -> List[Dict[str, Any]]:
        """Fetch top stories from HackerNews."""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                # Get top story IDs
                resp = await client.get(
                    "https://hacker-news.firebaseio.com/v0/topstories.json",
                    timeout=10.0,
                )
                if resp.status_code == 200:
                    story_ids = resp.json()[:15]
                    stories = []
                    for sid in story_ids[:10]:
                        detail = await client.get(
                            f"https://hacker-news.firebaseio.com/v0/item/{sid}.json",
                            timeout=5.0,
                        )
                        if detail.status_code == 200:
                            stories.append(detail.json())
                    return stories
        except Exception as e:
            self.log.warning(f"HackerNews API error, using mock: {e}")
        return self._mock_stories()

    async def analyze(self, raw_data: List[Dict[str, Any]]) -> AgentResult:
        """Analyze HN stories for startup and trend signals."""
        insights = []
        signals = []

        for story in raw_data:
            title = story.get("title", "")
            score = story.get("score", 0)
            url = story.get("url", "")

            if score > 50:
                insights.append({
                    "id": generate_id("si"),
                    "title": f"HN Trending: {title[:80]}",
                    "content": f"{title} (Score: {score}). URL: {url}",
                    "source": "hackernews",
                    "confidence": min(score / 500, 0.9),
                    "tags": ["hackernews", "startup", "trending"],
                    "created_at": now_iso(),
                })

            # Detect startup signals
            startup_keywords = ["launch", "announce", "funding", "yc", "series"]
            if any(kw in title.lower() for kw in startup_keywords):
                signals.append({
                    "id": generate_id("ss"),
                    "title": f"Startup Signal: {title[:60]}",
                    "description": f"Detected on HN with score {score}",
                    "source": "hackernews",
                    "signal_type": "startup",
                    "strength": min(score / 300, 0.9),
                    "detected_at": now_iso(),
                })

        return AgentResult(agent_name=self.name, insights=insights, signals=signals)

    def _mock_stories(self) -> List[Dict[str, Any]]:
        return [
            {"title": "Show HN: We built an AI agent that writes production code", "score": 450, "url": "https://example.com/1"},
            {"title": "Series A: $50M for autonomous vehicle startup", "score": 320, "url": "https://example.com/2"},
            {"title": "Launch HN: Open-source alternative to Notion with AI", "score": 280, "url": "https://example.com/3"},
            {"title": "The future of edge computing in healthcare", "score": 190, "url": "https://example.com/4"},
            {"title": "YC W24: Our picks for the most interesting startups", "score": 410, "url": "https://example.com/5"},
        ]


startup_radar_agent = StartupRadarAgent()
