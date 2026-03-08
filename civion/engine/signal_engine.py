"""
CIVION Signal Engine
Cross-source pattern detection and signal correlation.
"""
from __future__ import annotations
import random
from datetime import datetime
from typing import Any, Dict, List
from civion.core.logger import engine_logger
from civion.services.data_service import data_service
from civion.utils.helpers import generate_id, now_iso

log = engine_logger("signal_engine")


class SignalEngine:
    """Detects patterns across multiple intelligence signals."""

    async def detect_patterns(self) -> List[Dict[str, Any]]:
        """Scan all signals for cross-source patterns."""
        signals = await data_service.list_signals(limit=100)
        patterns = []

        # Group signals by source
        by_source: Dict[str, List[Dict]] = {}
        for signal in signals:
            src = signal.get("source", "unknown")
            if src not in by_source:
                by_source[src] = []
            by_source[src].append(signal)

        # Find cross-source correlations
        if len(by_source) >= 2:
            sources = list(by_source.keys())
            for i, src_a in enumerate(sources):
                for src_b in sources[i + 1:]:
                    # Simple keyword matching between sources
                    for sig_a in by_source[src_a][:5]:
                        for sig_b in by_source[src_b][:5]:
                            overlap = self._word_overlap(
                                sig_a.get("title", "") + " " + sig_a.get("description", ""),
                                sig_b.get("title", "") + " " + sig_b.get("description", ""),
                            )
                            if overlap > 0.3:
                                pattern = {
                                    "id": generate_id("pat"),
                                    "type": "cross_source_correlation",
                                    "sources": [src_a, src_b],
                                    "signals": [sig_a.get("id"), sig_b.get("id")],
                                    "strength": overlap,
                                    "description": f"Correlation between {src_a} and {src_b}: "
                                                   f"{sig_a.get('title', '')[:40]} ↔ {sig_b.get('title', '')[:40]}",
                                    "detected_at": now_iso(),
                                }
                                patterns.append(pattern)
                                
                                # Broadcast signal detected
                                from civion.api.websocket import manager
                                await manager.broadcast("signal_detected", pattern)

        if patterns:
            log.info(f"Detected {len(patterns)} cross-source patterns")
        return patterns

    async def get_signal_summary(self) -> Dict[str, Any]:
        """Get summary of all detected signals."""
        signals = await data_service.list_signals(limit=200)
        by_source = {}
        by_type = {}
        total_strength = 0

        for s in signals:
            src = s.get("source", "unknown")
            stype = s.get("signal_type", "unknown")
            by_source[src] = by_source.get(src, 0) + 1
            by_type[stype] = by_type.get(stype, 0) + 1
            total_strength += s.get("strength", 0.5)

        return {
            "total_signals": len(signals),
            "by_source": by_source,
            "by_type": by_type,
            "avg_strength": total_strength / len(signals) if signals else 0,
        }

    def _word_overlap(self, text_a: str, text_b: str) -> float:
        """Calculate word overlap between two texts."""
        words_a = set(text_a.lower().split())
        words_b = set(text_b.lower().split())
        if not words_a or not words_b:
            return 0.0
        intersection = words_a & words_b
        # Remove common words
        stopwords = {"the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "is", "are"}
        intersection -= stopwords
        return len(intersection) / max(len(words_a), len(words_b))


# Singleton
signal_engine = SignalEngine()
