"""
CIVION — Signal Engine
Collects insights from multiple agents and generates unified collaboration signals
when patterns or anomalies are detected.
"""

import logging
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any

from civion.storage.database import DB_PATH, get_insights
import aiosqlite

logger = logging.getLogger("civion.signals")

class SignalEngine:
    def __init__(self, interval: int = 300):
        self.interval = interval
        self.is_running = False

    async def start(self):
        if self.is_running: return
        self.is_running = True
        logger.info("Signal Engine started (interval: %ds)", self.interval)
        asyncio.create_task(self._run_loop())

    async def stop(self):
        self.is_running = False
        logger.info("Signal Engine stopped")

    async def _run_loop(self):
        while self.is_running:
            try:
                await self.process_signals()
            except Exception as e:
                logger.error("Error in signal processing loop: %s", e)
            await asyncio.sleep(self.interval)

    async def process_signals(self):
        """Scan recent insights and generate signals."""
        logger.debug("Processing signals...")
        
        # 1. Get recent insights (last 30 mins)
        insights = await get_insights(limit=100)
        # In a real system, we'd filter by timestamp and use LLM to detect patterns
        
        # 2. Mock pattern detection (for demonstration)
        # group insights by topic
        topics = {}
        for i in insights:
            topic = i.get('title', 'Unknown')
            if topic not in topics: topics[topic] = []
            topics[topic].append(i)
            
        for topic, related in topics.items():
            if len(related) >= 2:
                # Potential signal!
                agents = list(set([r['agent_name'] for r in related]))
                if len(agents) >= 2:
                    await self.emit_signal(
                        title=f"Collective Pattern: {topic}",
                        description=f"Multiple agents ({', '.join(agents)}) detected activity related to {topic}.",
                        confidence=0.85,
                        agents_involved=agents,
                        supporting_insights=[r['id'] for r in related]
                    )

    async def emit_signal(self, title: str, description: str, confidence: float, agents_involved: List[str], supporting_insights: List[int]):
        """Save a new signal to the database if it doesn't already exist."""
        async with aiosqlite.connect(str(DB_PATH)) as db:
            # Check for duplicates within the last hour
            hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
            async with db.execute(
                "SELECT id FROM collaboration_signals WHERE title = ? AND created_at > ?",
                (title, hour_ago)
            ) as cursor:
                if await cursor.fetchone():
                    return

            await db.execute(
                """INSERT INTO collaboration_signals 
                   (title, description, confidence, agents_involved, supporting_insights, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (title, description, confidence, json.dumps(agents_involved), json.dumps(supporting_insights), datetime.now().isoformat())
            )
            await db.commit()
            logger.info("Generated Signal: %s (Confidence: %.2f)", title, confidence)

signal_engine = SignalEngine()
