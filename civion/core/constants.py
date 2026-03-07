"""
CIVION Constants
System-wide constants and enumerations.
"""
from __future__ import annotations
from enum import Enum


# ── Agent States ─────────────────────────────────────
class AgentState(str, Enum):
    IDLE = "idle"
    SCANNING = "scanning"
    ANALYZING = "analyzing"
    REPORTING = "reporting"
    ERROR = "error"
    STOPPED = "stopped"


# ── Signal Confidence Levels ────────────────────────
class ConfidenceLevel(str, Enum):
    LOW = "low"           # 0.0 - 0.3
    MEDIUM = "medium"     # 0.3 - 0.6
    HIGH = "high"         # 0.6 - 0.8
    VERY_HIGH = "very_high"  # 0.8 - 1.0


# ── Goal States ──────────────────────────────────────
class GoalState(str, Enum):
    CREATED = "created"
    DECOMPOSED = "decomposed"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"


# ── Prediction States ────────────────────────────────
class PredictionState(str, Enum):
    PENDING = "pending"
    VERIFIED_TRUE = "verified_true"
    VERIFIED_FALSE = "verified_false"
    EXPIRED = "expired"


# ── Reasoning States ─────────────────────────────────
class ReasoningState(str, Enum):
    GATHERING = "gathering_arguments"
    DEBATING = "debating"
    SYNTHESIZING = "synthesizing"
    CONSENSUS = "consensus_reached"


# ── Default Agent Names ──────────────────────────────
DEFAULT_AGENTS = [
    "github_trend",
    "research_monitor",
    "startup_radar",
    "market_signal",
    "cyber_threat",
    "memory",
    "sentiment",
]

# ── Signal Sources ───────────────────────────────────
SIGNAL_SOURCES = [
    "github", "arxiv", "hackernews", "news",
    "coingecko", "twitter", "google_trends", "web",
]

# ── LLM Providers ───────────────────────────────────
LLM_PROVIDERS = ["openai", "anthropic", "google", "mock"]

# ── API Version ──────────────────────────────────────
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# ── Rate Limits ──────────────────────────────────────
DEFAULT_RATE_LIMIT = 60  # requests per minute
AGENT_SCAN_INTERVAL = 300  # seconds between scans
MAX_CONCURRENT_AGENTS = 10
