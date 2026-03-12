"""Market signal agent - analyzes news and market signals"""
import httpx
import logging
import os
from typing import Dict, List, Optional, Any
from civion.agents.base_agent import BaseAgent
from civion.core.config import config

log = logging.getLogger(__name__)

class MarketAgent(BaseAgent):
    """Analyzes market sentiment and industry trends from news.
    
    Monitors global news sources to identify market sentiment
    and key indicators of technological shifts.
    
    Attributes:
        api_url (str): NewsAPI endpoint.
    """
    
    def __init__(self) -> None:
        """Initialize market agent with NewsAPI endpoint."""
        super().__init__("MarketAgent")
        self.api_url = "https://newsapi.org/v2/everything"
    
    async def analyze(self, topic: str) -> Dict[str, Any]:
        """Analyze market signals for a given topic.
        
        Fetches news articles, calculates sentiment, and
        synthesizes market analysis using LLM.
        
        Args:
            topic: Search term for market news.
                Example: "artificial intelligence", "green energy"
        
        Returns:
            Dictionary with analysis results:
            - agent (str): Agent name
            - analysis (str): LLM synthesis of findings
            - confidence (float): Confidence score 0-1
            - data (dict): Raw metrics (article count, sentiment ratio, etc)
            - position (str): "support", "challenge", or "neutral"
        
        Raises:
            No exceptions raised; returns fallback on error
        """
        try:
            # Fetch news data
            data = await self._fetch_news_data(topic)
            
            if not data or not data.get('articles'):
                return self._fallback_response("No news data found")
            
            articles = data.get('articles', [])
            total_articles = len(articles)
            
            # Calculate sentiment
            positive_count = sum(1 for a in articles if self._is_positive_sentiment(a.get('description') or a.get('title') or ''))
            sentiment = "positive" if positive_count > total_articles * 0.6 else "negative" if positive_count < total_articles * 0.4 else "neutral"
            
            # Synthesize with LLM
            sources = list(set(a.get('source', {}).get('name', 'Unknown') for a in articles[:5]))
            data_summary = f"""
            Market News Analysis for '{topic}':
            - Total articles found: {total_articles}
            - Positive sentiment articles: {positive_count}
            - Overall sentiment: {sentiment}
            - Top sources: {', '.join(sources)}
            """
            
            analysis = await self._get_llm_analysis("market signals", data_summary)
            
            return {
                "agent": "MarketAgent",
                "analysis": analysis,
                "confidence": 0.70,
                "data": {
                    "articles_found": total_articles,
                    "sentiment": sentiment,
                    "positive_ratio": positive_count / total_articles if total_articles > 0 else 0,
                    "trend": "up" if sentiment == "positive" else "down" if sentiment == "negative" else "stable"
                },
                "position": "support" if sentiment == "positive" else "challenge" if sentiment == "negative" else "neutral"
            }
        
        except Exception as e:
            log.error(f"Market agent error: {str(e)}")
            return self._fallback_response(f"Market analysis error: {str(e)}")
    
    async def _fetch_news_data(self, topic: str) -> Optional[Dict[str, Any]]:
        """Fetch news data from NewsAPI or mock fallback.
        
        Args:
            topic: The market topic to search for.
            
        Returns:
            Optional dictionary containing list of articles.
        """
        try:
            api_key = os.getenv('NEWSAPI_KEY', '')
            
            if not api_key:
                log.warning("NEWSAPI_KEY not set, using mock fallback")
                return self._get_mock_news_data(topic)
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.api_url,
                    params={
                        "q": topic,
                        "sortBy": "publishedAt",
                        "language": "en",
                        "apiKey": api_key,
                        "pageSize": 30
                    },
                    timeout=config.AGENT_TIMEOUT
                )
                response.raise_for_status()
                return response.json()
        
        except Exception as e:
            log.error(f"NewsAPI error: {str(e)}, using mock fallback")
            return self._get_mock_news_data(topic)
    
    def _is_positive_sentiment(self, text: str) -> bool:
        """Simple keyword-based sentiment detection.
        
        Args:
            text: Text to analyze.
            
        Returns:
            True if positive words outweigh negative, False otherwise.
        """
        positive_words = ['great', 'excellent', 'boom', 'surge', 'growth', 'rise', 'gain', 'win', 'success', 'up', 'breakthrough']
        negative_words = ['crash', 'fall', 'loss', 'decline', 'down', 'fail', 'bad', 'poor', 'drop', 'warning']
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        return pos_count > neg_count
    
    def _fallback_response(self, error_msg: str) -> Dict[str, Any]:
        """Return fallback response when analysis fails.
        
        Args:
            error_msg: Reason for fallback.
        
        Returns:
            Dictionary with fallback analysis results.
        """
        return {
            "agent": "MarketAgent",
            "analysis": f"Market analysis unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }

    def _get_mock_news_data(self, topic: str) -> Dict[str, Any]:
        """Get pre-defined mock news data for fallback.
        
        Args:
            topic: Search topic for mock content.
            
        Returns:
            Dictionary with mock articles.
        """
        return {
            "articles": [
                {
                    "title": f"{topic} Market Trends",
                    "description": f"Analysis of {topic} market signals",
                    "source": {"name": "Market Analysis"},
                    "publishedAt": "2025-03-11T00:00:00Z"
                },
                {
                    "title": f"{topic} Growth Indicators",
                    "description": f"Key indicators for {topic} sector",
                    "source": {"name": "Industry Report"},
                    "publishedAt": "2025-03-10T00:00:00Z"
                }
            ]
        }
