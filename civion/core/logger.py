"""
CIVION Rich Logger
Beautiful console logging with Rich formatting.
"""
from __future__ import annotations
import logging
import sys
from datetime import datetime
from rich.console import Console
from rich.logging import RichHandler
from rich.theme import Theme

# ── Custom Theme ─────────────────────────────────────
civion_theme = Theme({
    "info": "cyan",
    "warning": "yellow",
    "error": "red bold",
    "success": "green",
    "agent": "magenta bold",
    "engine": "blue bold",
    "signal": "green bold",
    "timestamp": "dim cyan",
})

console = Console(theme=civion_theme)


def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """Create a Rich-powered logger for any CIVION module."""
    logger = logging.getLogger(f"civion.{name}")

    if not logger.handlers:
        handler = RichHandler(
            console=console,
            show_time=True,
            show_path=False,
            rich_tracebacks=True,
            tracebacks_show_locals=False,
            markup=True,
        )
        handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(handler)

    logger.setLevel(level)
    return logger


# Pre-built loggers for common modules
def agent_logger(agent_name: str) -> logging.Logger:
    return get_logger(f"agent.{agent_name}")


def engine_logger(engine_name: str) -> logging.Logger:
    return get_logger(f"engine.{engine_name}")


def api_logger() -> logging.Logger:
    return get_logger("api")


def cli_logger() -> logging.Logger:
    return get_logger("cli")


# ── Banner ───────────────────────────────────────────
def print_banner():
    """Print the CIVION startup banner."""
    banner = """
[green bold]
   ██████╗██╗██╗   ██╗██╗ ██████╗ ███╗   ██╗
  ██╔════╝██║██║   ██║██║██╔═══██╗████╗  ██║
  ██║     ██║██║   ██║██║██║   ██║██╔██╗ ██║
  ██║     ██║╚██╗ ██╔╝██║██║   ██║██║╚██╗██║
  ╚██████╗██║ ╚████╔╝ ██║╚██████╔╝██║ ╚████║
   ╚═════╝╚═╝  ╚═══╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
[/green bold]
[dim]  AI Intelligence Command Center v2.0.0[/dim]
    """
    console.print(banner)
