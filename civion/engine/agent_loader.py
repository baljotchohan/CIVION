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
            import traceback
            tb = traceback.format_exc()
            logger.error(
                "Failed to import agent module %s:\n%s",
                modname,
                tb
            )
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
                    # Validate required attributes before instantiation
                    required_attributes = ['name', 'description', 'personality', 'interval']
                    for required_attr in required_attributes:
                        if not hasattr(attr, required_attr):
                            raise ValueError(
                                f"Agent {attr.__name__} missing required attribute: {required_attr}"
                            )
                    
                    # Validate personality value
                    valid_personalities = ["Explorer", "Analyst", "Watcher", "Predictor"]
                    if attr.personality not in valid_personalities:
                        raise ValueError(
                            f"Agent {attr.__name__} has invalid personality: {attr.personality}. "
                            f"Must be one of: {', '.join(valid_personalities)}"
                        )
                    
                    # Instantiate agent
                    instance = attr()
                    found.append(instance)
                    seen_classes.add(attr.__name__)
                    logger.info(
                        "Discovered agent: %s (%s) from %s",
                        instance.name,
                        instance.personality,
                        modname,
                    )
                    
                except ValueError as ve:
                    logger.error("Validation error for %s: %s", attr.__name__, str(ve))
                    
                except Exception as exc:
                    import traceback
                    logger.error(
                        "Failed to instantiate %s from %s:\n%s",
                        attr.__name__,
                        modname,
                        traceback.format_exc()
                    )

    logger.info("Agent loader: discovered %d agent(s)", len(found))
    return found
