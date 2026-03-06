"""
CIVION — Signal Engine
Collects insights from multiple agents and generates unified collaboration signals
when patterns or anomalies are detected using LLM synthesis.
"""

import logging
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any

import aiosqlite

from civion.storage.database import DB_PATH, get_insights
from civion.services.llm_service import llm

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
        """Scan recent insights and generate signals via LLM synthesis."""
        logger.debug("Processing signals...")
        
        # 1. Get recent insights (last 50)
        insights = await get_insights(limit=50)
        if not insights:
            return

        # Prepare digest for LLM
        digest_lines = []
        for i in insights:
            digest_lines.append(f"[{i['agent_name']}] {i['title']}: {i['content'][:300]}")
        
        digest = "\n".join(digest_lines)
        
        # 2. Ask LLM to detect cross-cutting patterns
        prompt = f"""
        Analyze the following agent insights and identify cross-cutting patterns or emerging trends.
        Synthesize these findings into 1-2 powerful "Intelligence Signals".
        
        Agent findings:
        {digest}
        
        Return a JSON list of objects. Each object must have:
        "title": string (trend name)
        "description": string (detailed explanation)
        "confidence": float (0.0 to 1.0)
        "agents": list of strings (agents involved)
        
        Return ONLY valid JSON. If no pattern is found, return [].
        """
        
        try:
            response = await llm.generate(prompt, system="You are the CIVION Signal Engine. You detect patterns across multiple agents.")
            response = response.strip()
            if response.startswith("```"):
                response = response.split("```")[1]
                if response.startswith("json"): response = response[4:]
            
            signals = json.loads(response.strip())
            for sig in signals:
                if not isinstance(sig, dict): continue
                await self.emit_signal(
                    title=sig.get("title", "Signal"),
                    description=sig.get("description", ""),
                    confidence=sig.get("confidence", 0.5),
                    agents_involved=sig.get("agents", []),
                    supporting_insights=[i["id"] for i in insights if i["agent_name"] in sig.get("agents", [])]
                )
        except Exception as e:
            logger.error("LLM Signal synthesis failed: %s", e)

    async def emit_signal(self, title: str, description: str, confidence: float, agents_involved: List[str], supporting_insights: List[int]):
        """Save and broadcast a new signal."""
        async with aiosqlite.connect(str(DB_PATH)) as db:
            # Avoid dupes in last 2 hours
            cutoff = (datetime.now() - timedelta(hours=2)).isoformat()
            async with db.execute(
                "SELECT 1 FROM collaboration_signals WHERE title = ? AND created_at > ?",
                (title, cutoff)
            ) as cur:
                if await cur.fetchone(): return

            now = datetime.now().isoformat()
            cursor = await db.execute(
                """INSERT INTO collaboration_signals 
                   (title, description, confidence, agents_involved, supporting_insights, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (title, description, confidence, json.dumps(agents_involved), json.dumps(supporting_insights), now)
            )
            await db.commit()
            signal_id = cursor.lastrowid
            logger.info("Generated Signal: %s (Confidence: %.2f)", title, confidence)

            # WebSocket Broadcast
            try:
                from civion.api.server import manager
                # Use a task to broadcast without blocking
                asyncio.create_task(manager.broadcast({
                    "type": "new_signal",
                    "data": {
                        "id": signal_id,
                        "title": title,
                        "description": description,
                        "confidence": confidence,
                        "agents": agents_involved,
                        "created_at": now
                    }
                }))
            except Exception: pass

signal_engine = SignalEngine()

async def get_signals(limit: int = 20):
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM collaboration_signals ORDER BY created_at DESC LIMIT ?", 
            (limit,)
        ) as cur:
            rows = await cur.fetchall()
            signals = []
            for r in rows:
                sig = dict(r)
                # Parse JSON fields
                try:
                    if isinstance(sig.get("agents_involved"), str):
                        sig["agents_involved"] = json.loads(sig["agents_involved"])
                    if isinstance(sig.get("supporting_insights"), str):
                        sig["supporting_insights"] = json.loads(sig["supporting_insights"])
                except Exception:
                    sig["agents_involved"] = sig.get("agents_involved") or []
                    sig["supporting_insights"] = sig.get("supporting_insights") or []
                signals.append(sig)
            return signals

async def generate_signals(agent_data: list):
    """Manual trigger for signal generation from a set of agent results."""
    # This is a wrapper around the engine's logic for on-demand use
    return await signal_engine.process_signals()
