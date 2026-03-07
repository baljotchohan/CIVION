"""
CIVION Helpers
Common utility functions used across the application.
"""
from __future__ import annotations
import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional


def generate_id(prefix: str = "") -> str:
    """Generate a short unique ID with optional prefix."""
    short = str(uuid.uuid4())[:8]
    return f"{prefix}_{short}" if prefix else short


def now_iso() -> str:
    """Get current UTC time as ISO string."""
    return datetime.utcnow().isoformat()


def time_ago(iso_str: str) -> str:
    """Convert ISO timestamp to human-readable 'time ago' string."""
    try:
        dt = datetime.fromisoformat(iso_str)
        diff = datetime.utcnow() - dt
        if diff.days > 365:
            return f"{diff.days // 365}y ago"
        if diff.days > 30:
            return f"{diff.days // 30}mo ago"
        if diff.days > 0:
            return f"{diff.days}d ago"
        if diff.seconds > 3600:
            return f"{diff.seconds // 3600}h ago"
        if diff.seconds > 60:
            return f"{diff.seconds // 60}m ago"
        return "just now"
    except Exception:
        return "unknown"


def truncate(text: str, length: int = 100) -> str:
    """Truncate text with ellipsis."""
    return text[:length] + "..." if len(text) > length else text


def confidence_label(value: float) -> str:
    """Convert confidence float to label."""
    if value >= 0.8:
        return "very_high"
    elif value >= 0.6:
        return "high"
    elif value >= 0.3:
        return "medium"
    return "low"


def confidence_color(value: float) -> str:
    """Get color name for confidence level."""
    if value >= 0.8:
        return "green"
    elif value >= 0.6:
        return "cyan"
    elif value >= 0.3:
        return "yellow"
    return "red"


def hash_content(content: str) -> str:
    """Generate a short hash for deduplication."""
    return hashlib.md5(content.encode()).hexdigest()[:12]


def merge_dicts(base: Dict, override: Dict) -> Dict:
    """Deep merge two dictionaries."""
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = value
    return result


def chunk_list(lst: List[Any], size: int) -> List[List[Any]]:
    """Split a list into chunks of given size."""
    return [lst[i:i + size] for i in range(0, len(lst), size)]


def safe_get(data: Dict, *keys: str, default: Any = None) -> Any:
    """Safely traverse nested dicts."""
    current = data
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key, default)
        else:
            return default
    return current
