"""
CIVION Memory Service
In-memory knowledge graph for connecting insights, signals, and patterns.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from civion.core.logger import get_logger

log = get_logger("memory")


@dataclass
class MemoryNode:
    """A single node in the knowledge graph."""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    content: str = ""
    category: str = "general"  # insight, signal, prediction, event
    tags: List[str] = field(default_factory=list)
    connections: List[str] = field(default_factory=list)  # IDs of connected nodes
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    access_count: int = 0
    relevance_score: float = 0.5


class MemoryService:
    """In-memory knowledge graph for CIVION."""

    def __init__(self):
        self._nodes: Dict[str, MemoryNode] = {}
        self._index: Dict[str, List[str]] = {}  # tag -> [node_ids]

    async def store(
        self,
        content: str,
        category: str = "general",
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> MemoryNode:
        """Store a new memory node."""
        node = MemoryNode(
            content=content,
            category=category,
            tags=tags or [],
            metadata=metadata or {},
        )
        self._nodes[node.id] = node

        # Index by tags
        for tag in node.tags:
            if tag not in self._index:
                self._index[tag] = []
            self._index[tag].append(node.id)

        log.info(f"Stored memory [{node.id}]: {content[:50]}...")
        return node

    async def recall(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 10,
    ) -> List[MemoryNode]:
        """Recall relevant memories based on keyword matching."""
        results = []
        query_lower = query.lower()
        query_words = set(query_lower.split())

        for node in self._nodes.values():
            if category and node.category != category:
                continue

            # Simple relevance scoring
            content_lower = node.content.lower()
            score = 0.0
            for word in query_words:
                if word in content_lower:
                    score += 0.3
                if word in [t.lower() for t in node.tags]:
                    score += 0.5

            if score > 0:
                node.relevance_score = min(score, 1.0)
                node.access_count += 1
                results.append(node)

        results.sort(key=lambda n: n.relevance_score, reverse=True)
        return results[:limit]

    async def connect(self, node_id_a: str, node_id_b: str) -> bool:
        """Create a connection between two memory nodes."""
        if node_id_a in self._nodes and node_id_b in self._nodes:
            self._nodes[node_id_a].connections.append(node_id_b)
            self._nodes[node_id_b].connections.append(node_id_a)
            return True
        return False

    async def get_related(self, node_id: str, depth: int = 1) -> List[MemoryNode]:
        """Get nodes related to a given node up to a certain depth."""
        if node_id not in self._nodes:
            return []

        visited = set()
        queue = [(node_id, 0)]
        related = []

        while queue:
            current_id, current_depth = queue.pop(0)
            if current_id in visited or current_depth > depth:
                continue
            visited.add(current_id)

            node = self._nodes.get(current_id)
            if node and current_id != node_id:
                related.append(node)

            if node and current_depth < depth:
                for conn_id in node.connections:
                    queue.append((conn_id, current_depth + 1))

        return related

    async def search_by_tags(self, tags: List[str]) -> List[MemoryNode]:
        """Find memories with matching tags."""
        node_ids = set()
        for tag in tags:
            if tag in self._index:
                node_ids.update(self._index[tag])
        return [self._nodes[nid] for nid in node_ids if nid in self._nodes]

    async def get_stats(self) -> Dict[str, Any]:
        """Get memory service statistics."""
        categories = {}
        for node in self._nodes.values():
            categories[node.category] = categories.get(node.category, 0) + 1
        return {
            "total_nodes": len(self._nodes),
            "total_connections": sum(len(n.connections) for n in self._nodes.values()) // 2,
            "categories": categories,
            "total_tags": len(self._index),
        }

    def to_dict(self) -> Dict[str, Any]:
        """Serialize memory graph."""
        return {
            "nodes": {nid: {
                "id": n.id, "content": n.content, "category": n.category,
                "tags": n.tags, "connections": n.connections,
                "created_at": n.created_at, "access_count": n.access_count,
            } for nid, n in self._nodes.items()},
            "stats": {"total_nodes": len(self._nodes)},
        }


# Singleton
memory_service = MemoryService()
