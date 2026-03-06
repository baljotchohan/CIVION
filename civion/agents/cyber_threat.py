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

    async def run(self) -> AgentResult:
        # Using the CIRCL CVE API for recent vulnerabilities
        url = "https://cve.circl.lu/api/last"
        data = await api.get(url)
        
        if not data or not isinstance(data, list):
            return AgentResult(success=False, title="", content="Failed to fetch CVE data", events=[])
            
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
            content=analysis,
            events=[{
                "topic": "Security Vulnerability Detected",
                "description": "New CVEs identified. " + analysis[:100] + "...",
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "location": loc["name"],
            }]
        )
