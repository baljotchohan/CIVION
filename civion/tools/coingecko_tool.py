from __future__ import annotations
import httpx
from typing import Any
from civion.tools.base_tool import BaseTool, tool_registry

class CoinGeckoTool(BaseTool):
    """
    Retrieves cryptocurrency market data.
    """
    name = "coingecko_data"
    description = "Retrieves cryptocurrency market data and trends."

    async def execute(self, crypto_name: str = "bitcoin", **kwargs) -> dict[str, Any]:
        url = f"https://api.coingecko.com/api/v3/coins/{crypto_name.lower()}"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return {"error": f"Crypto '{crypto_name}' not found"}
                
            data = resp.json()
            market_data = data.get("market_data", {})
            return {
                "name": data.get("name"),
                "symbol": data.get("symbol"),
                "current_price_usd": market_data.get("current_price", {}).get("usd"),
                "price_change_24h": market_data.get("price_change_percentage_24h"),
                "market_cap_usd": market_data.get("market_cap", {}).get("usd")
            }

tool_registry.register(CoinGeckoTool)
