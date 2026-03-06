"""
CIVION — Dynamic Agent Loader
Scans the agents/ package at runtime, discovers classes that
inherit BaseAgent, and returns ready-to-register instances.

Uses pkgutil + importlib for zero-config agent discovery.
"""

from __future__ import annotations

import importlib
import logging
import pkgutil
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from civion.agents.base_agent import BaseAgent

logger = logging.getLogger("civion.loader")

# Modules to skip during discovery (not agents)
_SKIP_MODULES = frozenset({"base_agent", "__init__"})


def discover_agents() -> list["BaseAgent"]:
    """
    Scan ``civion.agents`` for any class that subclasses ``BaseAgent``
    and return instantiated instances.

    This allows developers to drop a new ``.py`` file into the agents/
    folder and have it automatically picked up on next startup.
    """
    from civion.agents.base_agent import BaseAgent
    import civion.agents as agents_pkg

    found: list[BaseAgent] = []
    seen_classes: set[str] = set()

    for _importer, modname, _ispkg in pkgutil.iter_modules(agents_pkg.__path__):
        if modname in _SKIP_MODULES:
            continue

        try:
            module = importlib.import_module(f"civion.agents.{modname}")
        except Exception as exc:
            logger.warning("Failed to import agents.%s: %s", modname, exc)
            continue

        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if (
                isinstance(attr, type)
                and issubclass(attr, BaseAgent)
                and attr is not BaseAgent
                and attr.__name__ not in seen_classes
            ):
                try:
                    instance = attr()
                    found.append(instance)
                    seen_classes.add(attr.__name__)
                    logger.info(
                        "Discovered agent: %s (%s) from %s",
                        instance.name,
                        instance.personality,
                        modname,
                    )
                except Exception as exc:
                    logger.warning(
                        "Failed to instantiate %s from %s: %s",
                        attr.__name__, modname, exc,
                    )

    logger.info("Agent loader: discovered %d agent(s)", len(found))
    return found
