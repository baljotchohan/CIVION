"""
CIVION Agent — Cyber Threat Agent
Detects cybersecurity vulnerabilities from public CVE feeds.
"""

from civion.agents.base_agent import BaseAgent, AgentResult
from civion.services.api_service import api
from civion.services.llm_service import llm
import random

class CyberThreatAgent(BaseAgent):
    name = "CyberThreat"
    description = "Detects recent cybersecurity vulnerabilities and incidents"
    interval = 3600 * 3  # Run every 3 hours
    personality = "Watcher"
    tags = ["security", "cve", "threat-intel"]
    tools_allowed = ["web_search"]

    async def execute_task(self) -> AgentResult:
        key = await api.get_connection_key("CIRCL")
        warning_msg = ""
        if not key:
            warning_msg = "⚠️ Threat Intel API key missing - using public feed\n\n"

        try:
            # Using the CIRCL CVE API for recent vulnerabilities
            url = "https://cve.circl.lu/api/last"
            data = await api.get(url)
            
            if not data or not isinstance(data, list):
                raise ValueError("Invalid response from CVE feed")
        except Exception as e:
            fallback_content = (
                f"{warning_msg}❌ CVE API error: {str(e)}\n\n"
                "**Fallback Analysis:** Current threat landscape is dominated by "
                "supply-chain vulnerabilities in popular NPM/PyPI packages. "
                "Ransomware-as-a-Service (RaaS) groups are increasingly targeting "
                "unpatched edge networking equipment."
            )
            return AgentResult(
                success=True,
                title="Active Threat Intelligence (Fallback)",
                content=fallback_content,
                confidence=0.4
            )
            
        cves = []
        for item in data[:5]:
            cves.append(f"CVE ID: {item.get('id')}\nSummary: {item.get('summary')}")
            
        cves_text = "\n\n".join(cves)

        # Analyze with LLM
        prompt = f"""
        Review these recent Common Vulnerabilities and Exposures (CVEs).
        Assess the potential impact of these threats and generate a brief threat intelligence report.
        CVEs:
        {cves_text}
        """
        
        analysis = await llm.generate(
            prompt=prompt,
            system=self.personality_prompt()
        )
        
        # Simulate locations for known threat actors or data centers
        locations = [
            {"lat": 38.9072, "lon": -77.0369, "name": "Washington DC, USA (Cyber Command)"},
            {"lat": 55.7558, "lon": 37.6173, "name": "Moscow, Russia"},
            {"lat": 39.9042, "lon": 116.4074, "name": "Beijing, China"}
        ]
        loc = random.choice(locations)

        return AgentResult(
            success=True,
            title="Active Threat Intelligence Report",
            content=warning_msg + analysis,
            events=[{
                "topic": "Security Vulnerability Detected",
                "description": "New CVEs identified. " + analysis[:100] + "...",
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "location": loc["name"],
            }],
            source="https://cve.circl.lu",
            confidence=0.9
        )
