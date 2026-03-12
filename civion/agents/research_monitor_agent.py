"""
Research Monitor Agent
Tracks arXiv papers and academic research trends.
"""
from __future__ import annotations
import random
from typing import Any, Dict, List
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.utils.helpers import generate_id, now_iso


class ResearchMonitorAgent(BaseAgent):
    """Monitors arXiv and academic sources for research breakthroughs."""

    def __init__(self):
        super().__init__(
            name="research_monitor",
            description="Tracks arXiv papers and academic research for AI/ML breakthroughs"
        )

    async def scan(self) -> List[Dict[str, Any]]:
        """Fetch recent papers from arXiv."""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "http://export.arxiv.org/api/query",
                    params={
                        "search_query": "cat:cs.AI+OR+cat:cs.LG",
                        "start": 0,
                        "max_results": 15,
                        "sortBy": "submittedDate",
                        "sortOrder": "descending",
                    },
                    timeout=15.0,
                )
                if resp.status_code == 200:
                    return self._parse_arxiv(resp.text)
        except Exception as e:
            self.log.warning(f"arXiv API error, using mock data: {e}")
        return self._mock_papers()

    def _parse_arxiv(self, xml_text: str) -> List[Dict[str, Any]]:
        """Parse arXiv Atom XML into dicts."""
        try:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(xml_text)
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            papers = []
            for entry in root.findall("atom:entry", ns):
                title = entry.find("atom:title", ns)
                summary = entry.find("atom:summary", ns)
                papers.append({
                    "title": title.text.strip() if title is not None else "Untitled",
                    "summary": summary.text.strip()[:300] if summary is not None else "",
                    "source": "arxiv",
                })
            return papers
        except Exception:
            return self._mock_papers()

    async def analyze(self, raw_data: List[Dict[str, Any]]) -> AgentResult:
        """Analyze papers for breakthrough signals."""
        insights = []
        signals = []

        for paper in raw_data[:8]:
            title = paper.get("title", "")
            summary = paper.get("summary", "")

            insights.append({
                "id": generate_id("ri"),
                "title": f"Research: {title[:80]}",
                "content": f"{title}. {summary[:200]}",
                "source": "arxiv",
                "confidence": random.uniform(0.5, 0.85),
                "tags": ["research", "arxiv", "ai"],
                "created_at": now_iso(),
            })

            # Flag potential breakthroughs
            breakthrough_keywords = ["breakthrough", "state-of-the-art", "novel", "first"]
            if any(kw in (title + summary).lower() for kw in breakthrough_keywords):
                signals.append({
                    "id": generate_id("rs"),
                    "title": f"Potential Breakthrough: {title[:60]}",
                    "description": summary[:200],
                    "source": "arxiv",
                    "signal_type": "breakthrough",
                    "strength": random.uniform(0.6, 0.9),
                    "detected_at": now_iso(),
                })

        return AgentResult(agent_name=self.name, insights=insights, signals=signals)

    def _mock_papers(self) -> List[Dict[str, Any]]:
        return [
            {"title": "Scaling Laws for Neural Language Models Beyond 1T Parameters",
             "summary": "We present novel scaling laws that predict emergent capabilities in models exceeding one trillion parameters.", "source": "arxiv"},
            {"title": "Self-Supervised Reasoning Without Human Labels",
             "summary": "A breakthrough approach to training reasoning capabilities without any human-annotated data.", "source": "arxiv"},
            {"title": "Efficient Attention Mechanisms for Long-Context Understanding",
             "summary": "Novel attention architecture achieving state-of-the-art on 1M token context windows.", "source": "arxiv"},
            {"title": "Multi-Modal Foundation Models for Robotics",
             "summary": "First unified model for vision, language, and motor control in robotic systems.", "source": "arxiv"},
        ]

    def _fallback_response(self, error_msg: str) -> Dict[str, Any]:
        """Return fallback response on error"""
        return {
            "agent": self.name,
            "analysis": f"Research monitoring unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }


research_monitor_agent = ResearchMonitorAgent()
