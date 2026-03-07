"""
Memory Agent
Consolidates and connects insights across the knowledge graph.
"""
from __future__ import annotations
from typing import Any, Dict, List
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.services.data_service import data_service
from civion.services.memory_service import memory_service
from civion.utils.helpers import generate_id, now_iso


class MemoryAgent(BaseAgent):
    """Consolidates insights and builds the knowledge graph."""

    def __init__(self):
        super().__init__(
            name="memory",
            description="Consolidates insights and builds knowledge graph connections"
        )

    async def scan(self) -> List[Dict[str, Any]]:
        """Scan recent insights for consolidation."""
        return await data_service.list_insights(limit=30)

    async def analyze(self, raw_data: List[Dict[str, Any]]) -> AgentResult:
        """Find patterns and connections across insights."""
        insights = []
        signals = []

        if len(raw_data) < 3:
            return AgentResult(agent_name=self.name)

        # Group by tags
        tag_groups: Dict[str, List[Dict]] = {}
        for item in raw_data:
            tags = item.get("tags", [])
            if isinstance(tags, str):
                import json
                try:
                    tags = json.loads(tags)
                except Exception:
                    tags = [tags]
            for tag in tags:
                if tag not in tag_groups:
                    tag_groups[tag] = []
                tag_groups[tag].append(item)

        # Find convergence patterns
        for tag, items in tag_groups.items():
            if len(items) >= 3:
                avg_confidence = sum(
                    item.get("confidence", 0.5) for item in items
                ) / len(items)

                insights.append({
                    "id": generate_id("mi"),
                    "title": f"Knowledge Convergence: {tag}",
                    "content": f"{len(items)} insights converge on topic '{tag}'. "
                               f"Average confidence: {avg_confidence:.2f}. "
                               f"Sources: {', '.join(set(i.get('source', 'unknown') for i in items))}",
                    "source": "memory_consolidation",
                    "confidence": min(avg_confidence + 0.1, 0.95),
                    "tags": ["convergence", tag, "memory"],
                    "created_at": now_iso(),
                })

                # Connect related memories
                item_ids = [i.get("id") for i in items if i.get("id")]
                for i, id_a in enumerate(item_ids):
                    for id_b in item_ids[i + 1:]:
                        await memory_service.connect(id_a, id_b)

        return AgentResult(agent_name=self.name, insights=insights, signals=signals)


memory_agent = MemoryAgent()
