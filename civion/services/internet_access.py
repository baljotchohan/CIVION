"""
Internet Access Manager
Provides web scraping, search, and API access for agents.
"""
import aiohttp
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Any, Optional

log = logging.getLogger(__name__)


class InternetAccessManager:
    """Shared internet access service for all agents.

    Provides async web scraping, search, and generic API calling
    through a persistent aiohttp session.
    """

    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None

    async def init(self):
        """Initialize the HTTP session."""
        if not self.session or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=15)
            self.session = aiohttp.ClientSession(timeout=timeout)
            log.info("InternetAccessManager session initialized")

    async def close(self):
        """Close the HTTP session."""
        if self.session and not self.session.closed:
            await self.session.close()
            log.info("InternetAccessManager session closed")

    # ── Web Scraping ─────────────────────────────────────

    async def scrape_webpage(self, url: str) -> Dict[str, Any]:
        """Scrape and extract text content from a webpage.

        Args:
            url: The URL to scrape.

        Returns:
            Dictionary with success status, title, content, and links.
        """
        try:
            await self._ensure_session()
            async with self.session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')

                # Remove non-content elements
                for tag in soup(["script", "style", "nav", "footer", "header"]):
                    tag.decompose()

                text = soup.get_text(separator='\n', strip=True)
                title = soup.find('title')
                links = [a.get('href') for a in soup.find_all('a', href=True)]

                return {
                    "success": True,
                    "url": url,
                    "title": title.string.strip() if title and title.string else "No title",
                    "content": text[:3000],
                    "links": links[:10]
                }
        except Exception as e:
            log.error(f"Scrape error for {url}: {e}")
            return {"success": False, "url": url, "error": str(e)}

    # ── Web Search ───────────────────────────────────────

    async def search_web(self, query: str, num_results: int = 10) -> List[Dict[str, Any]]:
        """Search the web using DuckDuckGo instant answer API.

        Args:
            query: Search query string.
            num_results: Maximum number of results to return.

        Returns:
            List of result dictionaries with title, url, snippet.
        """
        try:
            await self._ensure_session()
            url = "https://api.duckduckgo.com/"
            params = {"q": query, "format": "json", "no_redirect": 1, "no_html": 1}

            async with self.session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
                data = await response.json(content_type=None)

                results = []

                # Direct answer
                abstract = data.get("AbstractText", "")
                abstract_url = data.get("AbstractURL", "")
                if abstract and abstract_url:
                    results.append({
                        "title": data.get("Heading", ""),
                        "url": abstract_url,
                        "snippet": abstract[:300]
                    })

                # Related topics
                for topic in data.get("RelatedTopics", [])[:num_results]:
                    if isinstance(topic, dict) and "FirstURL" in topic:
                        results.append({
                            "title": topic.get("Text", "")[:100],
                            "url": topic.get("FirstURL", ""),
                            "snippet": topic.get("Text", "")[:300]
                        })

                return results[:num_results]
        except Exception as e:
            log.error(f"Search error for '{query}': {e}")
            return []

    # ── Generic API Caller ───────────────────────────────

    async def call_api(self, api_url: str, params: Optional[Dict] = None,
                       headers: Optional[Dict] = None) -> Dict[str, Any]:
        """Call any public JSON API.

        Args:
            api_url: The API endpoint URL.
            params: Optional query parameters.
            headers: Optional HTTP headers.

        Returns:
            Parsed JSON response or error dictionary.
        """
        try:
            await self._ensure_session()
            async with self.session.get(
                api_url,
                params=params,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    return await response.json(content_type=None)
                else:
                    return {"error": f"HTTP {response.status}"}
        except Exception as e:
            log.error(f"API call error for {api_url}: {e}")
            return {"error": str(e)}

    # ── Internal ─────────────────────────────────────────

    async def _ensure_session(self):
        """Lazily initialize session if needed."""
        if not self.session or self.session.closed:
            await self.init()


# Global singleton
internet = InternetAccessManager()
