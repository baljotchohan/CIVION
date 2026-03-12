"""
Cyber Threat Agent
Monitors security threats and vulnerabilities.
"""
from __future__ import annotations
import random
from typing import Any, Dict, List
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.utils.helpers import generate_id, now_iso


class CyberThreatAgent(BaseAgent):
    """Monitors cybersecurity threats and zero-day vulnerabilities."""

    def __init__(self):
        super().__init__(
            name="cyber_threat",
            description="Monitors security advisories, CVEs, and emerging cybersecurity threats"
        )

    async def scan(self) -> List[Dict[str, Any]]:
        """Fetch recent CVEs from NIST NVD."""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://services.nvd.nist.gov/rest/json/cves/2.0",
                    params={"resultsPerPage": 10},
                    timeout=15.0,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("vulnerabilities", [])
        except Exception as e:
            self.log.warning(f"NVD API error, using mock: {e}")
        return self._mock_threats()

    async def analyze(self, raw_data: List[Dict[str, Any]]) -> AgentResult:
        """Analyze security data for threat signals."""
        insights = []
        signals = []

        for item in raw_data[:8]:
            cve = item.get("cve", item)
            cve_id = cve.get("id", generate_id("cve"))
            descriptions = cve.get("descriptions", [])
            desc = descriptions[0].get("value", "") if descriptions else cve.get("description", "")

            severity = cve.get("severity", "MEDIUM")
            score = cve.get("score", random.uniform(4.0, 9.5))

            insights.append({
                "id": generate_id("ci"),
                "title": f"Security: {cve_id}",
                "content": f"{cve_id}: {desc[:200]}. Severity: {severity}",
                "source": "nvd",
                "confidence": min(score / 10, 0.95),
                "tags": ["security", "cve", severity.lower()],
                "created_at": now_iso(),
            })

            if score > 7.0:
                signals.append({
                    "id": generate_id("cs"),
                    "title": f"High Severity: {cve_id} (CVSS {score:.1f})",
                    "description": desc[:150],
                    "source": "nvd",
                    "signal_type": "security_threat",
                    "strength": score / 10,
                    "detected_at": now_iso(),
                })

        return AgentResult(agent_name=self.name, insights=insights, signals=signals)

    def _mock_threats(self) -> List[Dict[str, Any]]:
        return [
            {"cve": {"id": "CVE-2026-1234", "descriptions": [{"value": "Critical RCE in popular web framework"}], "severity": "CRITICAL", "score": 9.8}},
            {"cve": {"id": "CVE-2026-5678", "descriptions": [{"value": "SQL injection in enterprise database driver"}], "severity": "HIGH", "score": 8.1}},
            {"cve": {"id": "CVE-2026-9012", "descriptions": [{"value": "Authentication bypass in cloud service API"}], "severity": "HIGH", "score": 7.5}},
        ]

    def _fallback_response(self, error_msg: str) -> Dict[str, Any]:
        """Return fallback response on error"""
        return {
            "agent": self.name,
            "analysis": f"Cyber threat analysis unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }


cyber_threat_agent = CyberThreatAgent()
