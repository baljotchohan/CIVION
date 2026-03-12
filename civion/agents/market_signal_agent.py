"""
Market Signal Agent
Monitors crypto markets and financial signals via CoinGecko.
"""
from __future__ import annotations
import random
from typing import Any, Dict, List
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.utils.helpers import generate_id, now_iso


class MarketSignalAgent(BaseAgent):
    """Monitors crypto/market data for financial signals."""

    def __init__(self):
        super().__init__(
            name="market_signal",
            description="Monitors crypto markets and financial data for trading signals"
        )

    async def scan(self) -> List[Dict[str, Any]]:
        """Fetch market data from CoinGecko."""
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://api.coingecko.com/api/v3/coins/markets",
                    params={
                        "vs_currency": "usd",
                        "order": "market_cap_desc",
                        "per_page": 20,
                        "sparkline": "false",
                    },
                    timeout=15.0,
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            self.log.warning(f"CoinGecko API error, using mock: {e}")
        return self._mock_market()

    async def analyze(self, raw_data: List[Dict[str, Any]]) -> AgentResult:
        """Analyze market data for price and trend signals."""
        insights = []
        signals = []

        for coin in raw_data[:10]:
            name = coin.get("name", "Unknown")
            symbol = coin.get("symbol", "???").upper()
            price = coin.get("current_price", 0)
            change_24h = coin.get("price_change_percentage_24h", 0)
            market_cap = coin.get("market_cap", 0)

            # Significant price movements
            if abs(change_24h) > 5:
                direction = "surge" if change_24h > 0 else "drop"
                insights.append({
                    "id": generate_id("mi"),
                    "title": f"Market {direction.title()}: {name} ({symbol})",
                    "content": f"{name} {direction} {abs(change_24h):.1f}% in 24h. Price: ${price:,.2f}. Market Cap: ${market_cap:,.0f}",
                    "source": "coingecko",
                    "confidence": min(abs(change_24h) / 20, 0.9),
                    "tags": ["market", "crypto", symbol.lower()],
                    "created_at": now_iso(),
                })

            if abs(change_24h) > 10:
                signals.append({
                    "id": generate_id("ms"),
                    "title": f"Extreme Movement: {symbol} {change_24h:+.1f}%",
                    "description": f"{name} showing extreme {abs(change_24h):.1f}% movement",
                    "source": "coingecko",
                    "signal_type": "market_extreme",
                    "strength": min(abs(change_24h) / 25, 0.95),
                    "detected_at": now_iso(),
                })

        return AgentResult(agent_name=self.name, insights=insights, signals=signals)

    def _mock_market(self) -> List[Dict[str, Any]]:
        return [
            {"name": "Bitcoin", "symbol": "btc", "current_price": 98500, "price_change_percentage_24h": 3.2, "market_cap": 1930000000000},
            {"name": "Ethereum", "symbol": "eth", "current_price": 3650, "price_change_percentage_24h": -2.1, "market_cap": 440000000000},
            {"name": "Solana", "symbol": "sol", "current_price": 185, "price_change_percentage_24h": 12.5, "market_cap": 85000000000},
            {"name": "Cardano", "symbol": "ada", "current_price": 0.95, "price_change_percentage_24h": -8.3, "market_cap": 33000000000},
        ]

    def _fallback_response(self, error_msg: str) -> Dict[str, Any]:
        """Return fallback response on error"""
        return {
            "agent": self.name,
            "analysis": f"Market signal analysis unavailable: {error_msg}",
            "confidence": 0.3,
            "data": {"error": error_msg},
            "position": "neutral"
        }


market_signal_agent = MarketSignalAgent()
