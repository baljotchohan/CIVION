"""
Sentiment Agent
Analyzes sentiment across intelligence sources.
"""
from __future__ import annotations
import random
from typing import Any, Dict, List
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.services.data_service import data_service
from civion.services.llm_service import llm_service
from civion.utils.helpers import generate_id, now_iso


class SentimentAgent(BaseAgent):
    """Analyzes overall sentiment of gathered intelligence."""

    def __init__(self):
        super().__init__(
            name="sentiment",
            description="Analyzes sentiment and mood across all intelligence sources"
        )

    async def scan(self) -> List[Dict[str, Any]]:
        """Collect recent insights for sentiment analysis."""
        return await data_service.list_insights(limit=20)

    async def analyze(self, raw_data: List[Dict[str, Any]]) -> AgentResult:
        """Perform sentiment analysis on recent insights."""
        insights = []
        signals = []

        if not raw_data:
            return AgentResult(agent_name=self.name)

        # Analyze overall sentiment
        positive_count = 0
        negative_count = 0
        neutral_count = 0

        for item in raw_data:
            content = item.get("content", "").lower()
            pos_words = ["growth", "breakthrough", "surge", "innovation", "launch", "success"]
            neg_words = ["threat", "drop", "vulnerability", "crash", "decline", "risk"]

            pos_score = sum(1 for w in pos_words if w in content)
            neg_score = sum(1 for w in neg_words if w in content)

            if pos_score > neg_score:
                positive_count += 1
            elif neg_score > pos_score:
                negative_count += 1
            else:
                neutral_count += 1

        total = len(raw_data)
        sentiment_ratio = positive_count / total if total else 0.5

        overall = "bullish" if sentiment_ratio > 0.6 else "bearish" if sentiment_ratio < 0.4 else "neutral"

        insights.append({
            "id": generate_id("se"),
            "title": f"Sentiment Analysis: {overall.title()} ({sentiment_ratio:.0%} positive)",
            "content": f"Analysis of {total} recent insights: "
                       f"{positive_count} positive, {negative_count} negative, {neutral_count} neutral. "
                       f"Overall sentiment: {overall}.",
            "source": "sentiment_analysis",
            "confidence": 0.7,
            "tags": ["sentiment", overall],
            "created_at": now_iso(),
        })

        if abs(sentiment_ratio - 0.5) > 0.25:
            signals.append({
                "id": generate_id("ses"),
                "title": f"Strong {overall.title()} Sentiment Detected",
                "description": f"Sentiment ratio: {sentiment_ratio:.0%} ({positive_count}/{total} positive)",
                "source": "sentiment",
                "signal_type": "sentiment_shift",
                "strength": abs(sentiment_ratio - 0.5) * 2,
                "detected_at": now_iso(),
            })

        return AgentResult(agent_name=self.name, insights=insights, signals=signals)

    def _fallback_response(self, error_msg: str) -> Dict[str, Any]:
        """Return fallback response on error"""
        return {
            "agent": self.name,
            "analysis": f"Sentiment analysis unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }

    async def _scrape_supplementary(self, topic: str = "market sentiment") -> Dict[str, Any]:
        """Fetch supplementary web data for sentiment enrichment."""
        try:
            from civion.services.internet_access import internet
            results = await internet.search_web(f"{topic} sentiment analysis trends")
            scraped = []
            for r in results[:3]:
                if r.get('url'):
                    page = await internet.scrape_webpage(r['url'])
                    if page.get('success'):
                        scraped.append(page['content'][:500])
            return {"web_results": results, "scraped_content": scraped}
        except Exception as e:
            return {"web_results": [], "scraped_content": []}


sentiment_agent = SentimentAgent()
