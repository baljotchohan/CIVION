"""
CIVION Base Tool
Protocol for all data source tools.
"""
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from civion.core.logger import get_logger


class BaseTool(ABC):
    """Abstract base for all data source tools."""

    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.log = get_logger(f"tool.{name}")
        self._call_count = 0
        self._error_count = 0

    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the tool and return results."""
        ...

    async def __call__(self, **kwargs) -> Dict[str, Any]:
        """Callable interface."""
        self._call_count += 1
        try:
            return await self.execute(**kwargs)
        except Exception as e:
            self._error_count += 1
            self.log.error(f"Tool {self.name} error: {e}")
            return {"error": str(e), "tool": self.name}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "calls": self._call_count,
            "errors": self._error_count,
        }
