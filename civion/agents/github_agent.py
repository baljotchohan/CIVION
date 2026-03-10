"""GitHub trend agent - analyzes repository activity"""
import httpx
import logging
from datetime import datetime, timedelta
from civion.agents.base_agent import BaseAgent

log = logging.getLogger(__name__)

class GitHubAgent(BaseAgent):
    """Analyzes GitHub repository trends"""
    
    def __init__(self):
        super().__init__("GitHubAgent")
        self.api_url = "https://api.github.com/search/repositories"
    
    async def analyze(self, topic: str) -> dict:
        """Analyze GitHub trends for topic"""
        try:
            # Fetch GitHub data
            data = await self._fetch_github_data(topic)
            
            if not data:
                return self._fallback_response("No GitHub data found")
            
            # Analyze data
            total_count = data.get('total_count', 0)
            repos = data.get('items', [])
            
            # Calculate metrics
            avg_stars = sum(r.get('stargazers_count', 0) for r in repos) / len(repos) if repos else 0
            recent_repos = sum(1 for r in repos if self._is_recent(r.get('updated_at')))
            
            # Synthesize with LLM
            data_summary = f"""
            GitHub Repository Analysis for '{topic}':
            - Total repositories: {total_count}
            - Analyzed top {len(repos)} repositories
            - Average stars per repo: {avg_stars:.0f}
            - Recently updated (30 days): {recent_repos}
            - Top language: {self._get_top_language(repos)}
            """
            
            analysis = await self._get_llm_analysis("GitHub trends", data_summary)
            
            return {
                "agent": "GitHubAgent",
                "analysis": analysis,
                "confidence": min(0.75 + (total_count / 100000), 0.95),  # Higher confidence if more data
                "data": {
                    "total_repos": total_count,
                    "avg_stars": avg_stars,
                    "recent_repos": recent_repos,
                    "trend": "up" if recent_repos > 0 else "stable"
                },
                "position": "support"
            }
        
        except Exception as e:
            self.logger.error(f"GitHub agent error: {str(e)}")
            return self._fallback_response(f"GitHub analysis error: {str(e)}")
    
    async def _fetch_github_data(self, topic: str) -> dict:
        """Fetch from GitHub API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.api_url,
                    params={
                        "q": f"{topic}",
                        "sort": "stars",
                        "order": "desc",
                        "per_page": 30
                    },
                    timeout=10
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            self.logger.error(f"GitHub API error: {str(e)}")
            return None
    
    def _is_recent(self, date_str: str) -> bool:
        """Check if date is within last 30 days"""
        if not date_str:
            return False
        try:
            # Standard ISO format with Z or +HH:MM
            ds = date_str.replace('Z', '+00:00')
            date = datetime.fromisoformat(ds)
            now = datetime.now(date.tzinfo)
            return (now - date) < timedelta(days=30)
        except:
            return False
    
    def _get_top_language(self, repos: list) -> str:
        """Get most common language"""
        languages = [r.get('language') for r in repos if r.get('language')]
        if not languages:
            return "Unknown"
        from collections import Counter
        return Counter(languages).most_common(1)[0][0]
    
    def _fallback_response(self, error_msg: str) -> dict:
        """Return fallback response on error"""
        return {
            "agent": "GitHubAgent",
            "analysis": f"GitHub analysis unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }
