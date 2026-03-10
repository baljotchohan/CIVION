"""Market signal agent - analyzes news and market signals"""
import httpx
import logging
import os
from civion.agents.base_agent import BaseAgent

log = logging.getLogger(__name__)

class MarketAgent(BaseAgent):
    """Analyzes market signals from news"""
    
    def __init__(self):
        super().__init__("MarketAgent")
        self.api_url = "https://newsapi.org/v2/everything"
    
    async def analyze(self, topic: str) -> dict:
        """Analyze market signals"""
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
            self.logger.error(f"Market agent error: {str(e)}")
            return self._fallback_response(f"Market analysis error: {str(e)}")
    
    async def _fetch_news_data(self, topic: str) -> dict:
        """Fetch from NewsAPI"""
        try:
            api_key = os.getenv('NEWSAPI_KEY', '')
            
            if not api_key:
                self.logger.warning("NEWSAPI_KEY not set")
                return None
            
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
                    timeout=10
                )
                response.raise_for_status()
                return response.json()
        
        except Exception as e:
            self.logger.error(f"NewsAPI error: {str(e)}")
            return None
    
    def _is_positive_sentiment(self, text: str) -> bool:
        """Simple sentiment detection"""
        positive_words = ['great', 'excellent', 'boom', 'surge', 'growth', 'rise', 'gain', 'win', 'success', 'up', 'breakthrough']
        negative_words = ['crash', 'fall', 'loss', 'decline', 'down', 'fail', 'bad', 'poor', 'drop', 'warning']
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        return pos_count > neg_count
    
    def _fallback_response(self, error_msg: str) -> dict:
        """Return fallback response on error"""
        return {
            "agent": "MarketAgent",
            "analysis": f"Market analysis unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }
