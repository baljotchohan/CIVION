"""Research monitor agent - analyzes arXiv papers"""
import httpx
import feedparser
import logging
from datetime import datetime, timedelta
from civion.agents.base_agent import BaseAgent
from civion.core.config import config

log = logging.getLogger(__name__)

class ResearchAgent(BaseAgent):
    """
    Analyzes academic research papers on arXiv for technology signals.
    
    This agent monitors arXiv submissions to identify:
    - New research papers in specific domains
    - Emerging research trends and categories
    - Key active research areas
    """
    
    def __init__(self):
        """Initialize research agent with arXiv API endpoint."""
        super().__init__("ResearchAgent")
        self.api_url = "http://export.arxiv.org/api/query"
    
    async def analyze(self, topic: str) -> dict:
        """
        Analyze research trends for a given topic.
        
        Args:
            topic: Search term for arXiv papers
            
        Returns:
            dict: Agent result with analysis and confidence score
        """
        try:
            # Fetch arXiv data
            data = await self._fetch_arxiv_data(topic)
            
            if not data:
                return self._fallback_response("No research papers found")
            
            entries = data.get('entries', [])
            total_papers = len(entries)
            
            # Calculate metrics
            recent_papers = sum(1 for e in entries if self._is_recent(e.get('published')))
            categories = [e.get('arxiv_primary_category', {}).get('term', 'Unknown') for e in entries]
            
            # Get top category
            top_category = "Unknown"
            if categories:
                from collections import Counter
                top_category = Counter(categories).most_common(1)[0][0]
            
            # Synthesize with LLM
            data_summary = f"""
            Academic Research Analysis for '{topic}':
            - Total papers found: {total_papers}
            - Recently published (30 days): {recent_papers}
            - Top research category: {top_category}
            - Active research areas: {', '.join(list(set(categories))[:3])}
            """
            
            analysis = await self._get_llm_analysis("research trends", data_summary)
            
            return {
                "agent": "ResearchAgent",
                "analysis": analysis,
                "confidence": 0.80,
                "data": {
                    "total_papers": total_papers,
                    "recent_papers": recent_papers,
                    "top_category": top_category,
                    "trend": "up" if recent_papers > (total_papers * 0.3) else "stable"
                },
                "position": "support"
            }
        
        except Exception as e:
            log.error(f"Research agent error: {str(e)}")
            return self._fallback_response(f"Research analysis error: {str(e)}")
    
    async def _fetch_arxiv_data(self, topic: str) -> dict:
        """Fetch from arXiv API"""
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.api_url}?search_query=all:{topic}&max_results=30&sortBy=submittedDate&sortOrder=descending"
                response = await client.get(url, timeout=config.AGENT_TIMEOUT)
                response.raise_for_status()
                
                # Parse RSS feed
                feed = feedparser.parse(response.text)
                return {'entries': feed.entries}
        except httpx.TimeoutError:
            log.error(f"arXiv API timeout while searching '{topic}'")
            return None
        except httpx.ConnectError:
            log.error(f"arXiv connection failed")
            return None
        except httpx.HTTPStatusError as e:
            log.error(f"arXiv returned HTTP {e.response.status_code}")
            return None
        except Exception as e:
            log.error(f"Unexpected error fetching arXiv data: {str(e)}")
            return None
    
    def _is_recent(self, date_str: str) -> bool:
        """Check if date is within last 30 days"""
        if not date_str:
            return False
        try:
            # arXiv format: 2024-03-01T12:00:00Z
            ds = date_str.replace('Z', '+00:00')
            date = datetime.fromisoformat(ds)
            now = datetime.now(date.tzinfo)
            return (now - date) < timedelta(days=30)
        except Exception as e:
            log.error(f"Date parsing error: {str(e)}")
            return False
    
    def _fallback_response(self, error_msg: str) -> dict:
        """Return fallback response on error"""
        return {
            "agent": "ResearchAgent",
            "analysis": f"Research analysis unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }
