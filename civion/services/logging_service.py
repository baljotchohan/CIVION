"""
CIVION — Structured Logging Service
Configures Python's logging system with a clean, coloured formatter
and provides helpers to log agent runs, errors, events, and system startup.

All CIVION modules use ``logging.getLogger("civion.<module>")`` so logs
are routed through a single, consistent pipeline.
"""

from __future__ import annotations

import logging
import sys
from datetime import datetime, timezone
from typing import Any

from civion.storage.database import save_log


# ── Coloured Formatter ────────────────────────────────────────

class CivionFormatter(logging.Formatter):
    """Terminal-friendly formatter with colour codes and concise output."""

    COLOURS = {
        logging.DEBUG:    "\033[90m",      # grey
        logging.INFO:     "\033[36m",      # cyan
        logging.WARNING:  "\033[33m",      # yellow
        logging.ERROR:    "\033[31m",      # red
        logging.CRITICAL: "\033[1;31m",    # bold red
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        colour = self.COLOURS.get(record.levelno, "")
        ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
        return (
            f"{colour}{ts} [{record.levelname:<7}]{self.RESET} "
            f"\033[1m{record.name}\033[0m — {record.getMessage()}"
        )


# ── Setup ─────────────────────────────────────────────────────

_configured = False


def configure_logging(level: str = "INFO") -> None:
    """
    Call once at startup to set up the CIVION logging pipeline.
    Safe to call multiple times (idempotent).
    """
    global _configured
    if _configured:
        return

    root = logging.getLogger("civion")
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(CivionFormatter())
    root.addHandler(handler)

    # Suppress noisy third-party loggers
    for noisy in ("httpx", "httpcore", "asyncio", "apscheduler"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    _configured = True


# ── Database-backed logging helpers ───────────────────────────

async def log_agent(agent_name: str, message: str, level: str = "INFO") -> None:
    """Log an agent event both to stdout and to SQLite."""
    logger = logging.getLogger(f"civion.agent.{agent_name}")
    log_fn = getattr(logger, level.lower(), logger.info)
    log_fn(message)
    await save_log(agent_name, message, level)


async def log_system(message: str, level: str = "INFO") -> None:
    """Log a system-level event."""
    logger = logging.getLogger("civion.system")
    log_fn = getattr(logger, level.lower(), logger.info)
    log_fn(message)
    await save_log("CIVION", message, level)
