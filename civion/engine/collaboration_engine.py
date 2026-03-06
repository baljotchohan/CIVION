"""
CIVION — Collaboration Engine
Collects outputs from all agents, analyses cross-agent relationships,
and generates system-level "collaboration signals".

Example flow:
  TrendAgent → detects new AI repos
  A future NewsAgent → detects startup funding
  Collaboration engine → "AI robotics trend increasing"
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import aiosqlite

from civion.services.llm_service import llm
from civion.storage.database import DB_PATH


# ── Signal Generation ─────────────────────────────────────────

async def generate_signals(agent_results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Analyse a batch of agent results and produce collaboration signals.

    Each signal is a short intelligence summary that synthesises
    observations from multiple agents into a higher-level insight.
    """
    if not agent_results:
        return []

    # Build a concise digest of all agent outputs
    digest_lines = []
    for r in agent_results:
        agent = r.get("agent_name", r.get("name", "unknown"))
        title = r.get("title", "")
        content = (r.get("content", "") or "")[:500]
        digest_lines.append(f"[{agent}] {title}: {content}")

    digest = "\n".join(digest_lines)

    # Ask the LLM to synthesise
    prompt = (
        "You are an intelligence analyst for the CIVION agent platform.\n"
        "Below are outputs from multiple AI agents collected during the latest sweep.\n"
        "Identify cross-cutting patterns, emerging trends, or notable correlations.\n"
        "Return a JSON array of signal objects.  Each signal has:\n"
        '  {"title": "...", "description": "...", "confidence": 0.0-1.0, "agents_involved": ["..."]}\n'
        "Return ONLY the JSON array, no markdown fences.\n\n"
        f"Agent outputs:\n{digest}"
    )

    try:
        raw = await llm.generate(prompt=prompt, system="You output only valid JSON.")

        # Parse LLM response
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0]

        signals: list[dict[str, Any]] = json.loads(raw)
        if not isinstance(signals, list):
            signals = [signals]
    except Exception:
        # Fallback: generate a simple signal without LLM
        signals = [
            {
                "title": "Agent Sweep Complete",
                "description": f"Collected outputs from {len(agent_results)} agent(s).",
                "confidence": 0.5,
                "agents_involved": [r.get("agent_name", r.get("name", "")) for r in agent_results],
            }
        ]

    # Persist signals to database
    saved: list[dict[str, Any]] = []
    now = datetime.now(timezone.utc).isoformat()

    async with aiosqlite.connect(str(DB_PATH)) as db:
        for sig in signals:
            title = sig.get("title", "Signal")[:200]
            desc = sig.get("description", "")[:2000]
            confidence = float(sig.get("confidence", 0.5))
            agents = json.dumps(sig.get("agents_involved", []))

            cursor = await db.execute(
                """INSERT INTO collaboration_signals
                   (title, description, confidence, agents_involved, created_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (title, desc, confidence, agents, now),
            )
            saved.append({
                "id": cursor.lastrowid,
                "title": title,
                "description": desc,
                "confidence": confidence,
                "agents_involved": sig.get("agents_involved", []),
                "created_at": now,
            })
        await db.commit()

    return saved


# ── Retrieval ─────────────────────────────────────────────────

async def get_signals(limit: int = 20) -> list[dict[str, Any]]:
    """Fetch the most recent collaboration signals."""
    async with aiosqlite.connect(str(DB_PATH)) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM collaboration_signals ORDER BY id DESC LIMIT ?",
            (limit,),
        ) as cur:
            rows = await cur.fetchall()
            results = []
            for row in rows:
                d = dict(row)
                try:
                    d["agents_involved"] = json.loads(d.get("agents_involved", "[]"))
                except Exception:
                    d["agents_involved"] = []
                results.append(d)
            return results
