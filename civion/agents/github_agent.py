"""GitHub trend agent - analyzes repository activity"""
import httpx
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from civion.agents.base_agent import BaseAgent
from civion.core.config import config

log = logging.getLogger(__name__)

class GitHubAgent(BaseAgent):
    """Analyzes GitHub repository trends and development activity.
    
    This agent monitors GitHub to identify:
    - Emerging technologies and frameworks
    - Developer activity trends
    - Popular programming languages
    - Repository growth patterns
    
    Attributes:
        api_url (str): GitHub API search endpoint
    """
    
    def __init__(self) -> None:
        """Initialize GitHub agent with API endpoint."""
        super().__init__("GitHubAgent")
        self.api_url = "https://api.github.com/search/repositories"
    
    async def analyze(self, topic: str) -> Dict[str, Any]:
        """Analyze GitHub trends for a given topic.
        
        Fetches repository data from GitHub API, analyzes metrics,
        and synthesizes analysis using LLM.
        
        Args:
            topic: Search term for GitHub repositories
                Example: "machine learning", "web framework"
        
        Returns:
            Dictionary with analysis results:
            - agent (str): Agent name
            - analysis (str): LLM synthesis of findings
            - confidence (float): Confidence score 0-1
            - data (dict): Raw metrics (star count, languages, etc)
            - position (str): "support" or "challenge"
        
        Raises:
            No exceptions raised; returns fallback on error
        
        Example:
            >>> agent = GitHubAgent()
            >>> result = await agent.analyze("rust")
            >>> # print(result['confidence'])
            0.85
        """
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
            
            # Fetch supplementary web data
            web_data = await self._scrape_supplementary(topic)

            # Synthesize with LLM
            data_summary = f"""
            GitHub Repository Analysis for '{topic}':
            - Total repositories: {total_count}
            - Analyzed top {len(repos)} repositories
            - Average stars per repo: {avg_stars:.0f}
            - Recently updated (30 days): {recent_repos}
            - Top language: {self._get_top_language(repos)}
            - Web context: {'; '.join(web_data.get('scraped_content', [])[:2])}
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
            log.error(f"GitHub agent error: {str(e)}")
            return self._fallback_response(f"GitHub analysis error: {str(e)}")
    
    async def _fetch_github_data(self, topic: str) -> Optional[Dict[str, Any]]:
        """Fetch data from GitHub API.
        
        Args:
            topic: The topic to search for.
            
        Returns:
            Optional dictionary containing GitHub search results.
        """
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
                    timeout=config.AGENT_TIMEOUT,
                    follow_redirects=True
                )
                response.raise_for_status()
                return response.json()
        except httpx.TimeoutException:
            log.error(f"GitHub API timeout while searching '{topic}'")
            return None
        except httpx.ConnectError:
            log.error(f"GitHub connection failed")
            return None
        except httpx.HTTPStatusError as e:
            log.error(f"GitHub returned HTTP {e.response.status_code}")
            return None
        except Exception as e:
            log.error(f"Unexpected error fetching GitHub data: {str(e)}")
            return None
    
    def _is_recent(self, date_str: str) -> bool:
        """Check if date is within last 30 days.
        
        Args:
            date_str: ISO format date string.
            
        Returns:
            True if date is within 30 days, False otherwise.
        """
        if not date_str:
            return False
        try:
            # Standard ISO format with Z or +HH:MM
            ds = date_str.replace('Z', '+00:00')
            date = datetime.fromisoformat(ds)
            now = datetime.now(date.tzinfo)
            return (now - date) < timedelta(days=30)
        except Exception as e:
            log.error(f"Date parsing error: {str(e)}")
            return False
    
    def _get_top_language(self, repos: List[Dict[str, Any]]) -> Optional[str]:
        """Get most common language from a list of repositories.
        
        Args:
            repos: List of repository data dictionaries.
            
        Returns:
            The name of the most frequent language or None.
        """
        languages = [r.get('language') for r in repos if r.get('language')]
        if not languages:
            return "Unknown"
        from collections import Counter
        return Counter(languages).most_common(1)[0][0]
    
    async def _scrape_supplementary(self, topic: str) -> Dict[str, Any]:
        """Fetch supplementary web data for topic enrichment."""
        try:
            from civion.services.internet_access import internet
            results = await internet.search_web(f"{topic} github repositories trends")
            scraped = []
            for r in results[:3]:
                if r.get('url'):
                    page = await internet.scrape_webpage(r['url'])
                    if page.get('success'):
                        scraped.append(page['content'][:500])
            return {"web_results": results, "scraped_content": scraped}
        except Exception as e:
            log.warning(f"Supplementary scrape failed: {e}")
            return {"web_results": [], "scraped_content": []}

    def _fallback_response(self, error_msg: str) -> Dict[str, Any]:
        """Return fallback response when analysis fails.
        
        Args:
            error_msg: Reason for fallback (timeout, error, etc)
        
        Returns:
            Dictionary with fallback analysis
        """
        return {
            "agent": "GitHubAgent",
            "analysis": f"GitHub analysis unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }
