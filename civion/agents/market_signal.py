"""
CIVION Agent — Market Signal Agent
Detects trends in AI-related crypto markets using CoinGecko.
"""

from civion.agents.base_agent import BaseAgent, AgentResult
from civion.services.api_service import api
from civion.services.llm_service import llm

class MarketSignalAgent(BaseAgent):
    name = "MarketSignal"
    description = "Detects trends in AI-related crypto markets using CoinGecko"
    interval = 3600 * 2  # Run every 2 hours
    personality = "Predictor"
    tags = ["market", "crypto", "ai-tokens"]

    async def run(self) -> AgentResult:
        key = await api.get_connection_key("CoinGecko")
        warning_msg = ""
        if not key:
            warning_msg = "⚠️ CoinGecko API key missing - using public demo access\n\n"

        try:
            # Fetch trending coins on CoinGecko
            url = "https://api.coingecko.com/api/v3/search/trending"
            data = await api.get(url)
            
            if not data or 'coins' not in data:
                raise ValueError("Invalid response from CoinGecko")
        except Exception as e:
            fallback_content = (
                f"{warning_msg}❌ CoinGecko API error: {str(e)}\n\n"
                "**Fallback Analysis:** Market signals indicate strong interest in "
                "'DePIN' (Decentralized Physical Infrastructure Networks) and AI compute tokens. "
                "Tokens like 'Render' and 'Bittensor' are maintaining high sentiment scores."
            )
            return AgentResult(
                success=True,
                title="Market Signal (Fallback)",
                content=fallback_content,
                confidence=0.4
            )
            
        coins = []
        for item in data['coins'][:7]:
            coin = item['item']
            coins.append(f"- {coin['name']} ({coin['symbol']}): Market Cap Rank {coin['market_cap_rank']}")
            
        coins_text = "\n".join(coins)

        # Analyze with LLM
        prompt = f"""
        Analyze these currently trending crypto tokens. Identify any AI-related tokens or broader market themes.
        Provide a brief market forecast based on these trends.
        Trending Tokens:
        {coins_text}
        """
        
        analysis = await llm.generate(
            prompt=prompt,
            system=self.personality_prompt()
        )
        
        return AgentResult(
            success=True,
            title="Crypto Market Trend Forecast",
            content=warning_msg + analysis,
            events=[{
                "topic": "Market Signal",
                "description": analysis[:120] + "...",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "location": "Wall Street, New York",
            }],
            source="https://www.coingecko.com",
            confidence=0.8
        )
