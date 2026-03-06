"""
CIVION — Agent Sandbox
Provides a controlled environment for agents to access system resources safely.

Allowed operations:
  ✓ Read files  (within workspace)
  ✓ Write reports (to data/ directory)
  ✓ Call APIs   (via httpx)
  ✓ Run safe commands (allow-listed)

Blocked:
  ✗ Arbitrary file deletion
  ✗ Path traversal outside workspace
  ✗ Dangerous shell commands
  ✗ Direct database manipulation
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Any

import httpx

# ── Configuration ─────────────────────────────────────────────

# Base workspace directory — agents can only access files under here
_WORKSPACE = Path(__file__).resolve().parent.parent.parent
_DATA_DIR = _WORKSPACE / "data"
_REPORTS_DIR = _DATA_DIR / "reports"

# Shell commands that are considered safe
_SAFE_COMMANDS = frozenset({
    "echo", "date", "whoami", "uname", "cat", "head", "tail",
    "wc", "sort", "grep", "find", "ls", "pwd", "env",
    "python", "python3", "pip", "pip3",
})

# Blocked path patterns
_BLOCKED_PATTERNS = frozenset({
    "..", "~", "/etc", "/usr", "/bin", "/sbin", "/var",
    "/System", "/Library", "/private",
})


class SandboxError(Exception):
    """Raised when a sandbox operation is blocked."""


class AgentSandbox:
    """
    Controlled environment for agent operations.

    Agents receive a sandbox instance and must use it to
    interact with the file system, network, and commands.
    """

    def __init__(self, agent_name: str) -> None:
        self.agent_name = agent_name
        _REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # ── Path validation ───────────────────────────────────────

    def _validate_path(self, path: str | Path) -> Path:
        """Ensure the path is within the workspace and safe."""
        resolved = Path(path).resolve()

        # Check for blocked patterns in the string
        path_str = str(resolved)
        for blocked in _BLOCKED_PATTERNS:
            if blocked in str(path) and ".." in str(path):
                raise SandboxError(
                    f"Path traversal blocked: '{path}' contains '{blocked}'"
                )

        # Must be under workspace
        try:
            resolved.relative_to(_WORKSPACE)
        except ValueError:
            raise SandboxError(
                f"Access denied: '{resolved}' is outside workspace '{_WORKSPACE}'"
            )

        return resolved

    # ── File Operations ───────────────────────────────────────

    def read_file(self, path: str | Path) -> str:
        """Read a file within the workspace."""
        safe_path = self._validate_path(path)
        if not safe_path.exists():
            raise SandboxError(f"File not found: {safe_path}")
        if not safe_path.is_file():
            raise SandboxError(f"Not a file: {safe_path}")
        return safe_path.read_text(encoding="utf-8", errors="replace")

    def list_files(self, directory: str | Path = ".") -> list[str]:
        """List files in a directory within the workspace."""
        safe_path = self._validate_path(directory)
        if not safe_path.is_dir():
            raise SandboxError(f"Not a directory: {safe_path}")
        return [str(p.relative_to(safe_path)) for p in safe_path.iterdir()]

    # ── Report Writing ────────────────────────────────────────

    def write_report(self, filename: str, content: str) -> Path:
        """
        Write a report file to data/reports/.
        Returns the path to the written file.
        """
        # Sanitise filename
        safe_name = "".join(
            c if c.isalnum() or c in ("_", "-", ".") else "_"
            for c in filename
        )
        if not safe_name:
            safe_name = "report.txt"

        filepath = _REPORTS_DIR / safe_name
        filepath.write_text(content, encoding="utf-8")
        return filepath

    # ── API Calls ─────────────────────────────────────────────

    async def call_api(
        self,
        url: str,
        method: str = "GET",
        params: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
        timeout: int = 30,
    ) -> dict[str, Any] | list | str:
        """Make a sandboxed HTTP request."""
        method = method.upper()
        if method not in ("GET", "POST", "PUT", "PATCH"):
            raise SandboxError(f"HTTP method '{method}' is not allowed")

        async with httpx.AsyncClient(timeout=timeout) as client:
            if method == "GET":
                resp = await client.get(url, params=params, headers=headers)
            elif method == "POST":
                resp = await client.post(url, json=json_data, params=params, headers=headers)
            elif method == "PUT":
                resp = await client.put(url, json=json_data, headers=headers)
            else:
                resp = await client.patch(url, json=json_data, headers=headers)

            resp.raise_for_status()
            try:
                return resp.json()
            except Exception:
                return resp.text

    # ── Safe Commands ─────────────────────────────────────────

    def run_command(self, command: list[str], timeout: int = 15) -> str:
        """
        Run a safe shell command and return stdout.
        Only allow-listed commands can be executed.
        """
        if not command:
            raise SandboxError("Empty command")

        executable = Path(command[0]).name  # strip path prefixes
        if executable not in _SAFE_COMMANDS:
            raise SandboxError(
                f"Command '{executable}' is not allowed. "
                f"Allowed: {', '.join(sorted(_SAFE_COMMANDS))}"
            )

        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=str(_WORKSPACE),
            )
            return result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            raise SandboxError(f"Command timed out after {timeout}s")
        except Exception as exc:
            raise SandboxError(f"Command failed: {exc}")

    # ── Info ──────────────────────────────────────────────────

    def info(self) -> dict[str, Any]:
        return {
            "agent": self.agent_name,
            "workspace": str(_WORKSPACE),
            "reports_dir": str(_REPORTS_DIR),
            "safe_commands": sorted(_SAFE_COMMANDS),
        }
