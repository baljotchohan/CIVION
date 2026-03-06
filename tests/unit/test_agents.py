"""
Unit tests for CIVION built-in agents.
Ensures agents use APIs properly, handle missing data, and format results.
"""

import pytest

from civion.agents.base_agent import AgentResult
from civion.agents.trend_agent import TrendAgent
from civion.agents.startup_radar import StartupRadarAgent
from civion.agents.research_radar import ResearchPaperAgent
from civion.agents.market_signal import MarketSignalAgent
from civion.agents.cyber_threat import CyberThreatAgent

@pytest.mark.asyncio
async def test_github_trend_agent(mock_api, mock_llm):
    """Test the tech trend agent with mocked Github API."""
    mock_api.set_mock_response(
        "https://api.github.com/search/repositories",
        {"items": [
            {"full_name": "ai-project/1", "stargazers_count": 500, "description": "AI 1", "language": "Python"},
            {"full_name": "ai-project/2", "stargazers_count": 400, "description": "AI 2", "language": "Rust"}
        ]}
    )
    
    agent = TrendAgent()
    result = await agent.run()
    
    assert isinstance(result, AgentResult)
    assert result.success is True
    assert result.title == "Trending AI Repositories This Week"
    assert "Mocked LLM analysis output" in result.content
    assert mock_llm.last_prompt != ""

@pytest.mark.asyncio
async def test_github_trend_agent_api_failure(mock_api, mock_llm):
    """Test resilience when API returns unexpected format."""
    mock_api.set_mock_response("https://api.github.com/search/repositories", {"error": "Not found"})
    
    agent = TrendAgent()
    result = await agent.run()
    
    assert result.success is True
    assert "No trending AI repositories found this week." in result.content

@pytest.mark.asyncio
async def test_startup_radar_agent(mock_api, mock_llm):
    """Test StartupRadarAgent Agent."""
    mock_api.set_mock_response("https://hacker-news.firebaseio.com/v0/topstories.json", [1, 2])
    mock_api.set_mock_response("https://hacker-news.firebaseio.com/v0/item/1.json", {"title": "Startup 1", "url": "url1"})
    mock_api.set_mock_response("https://hacker-news.firebaseio.com/v0/item/2.json", {"title": "Startup 2", "url": "url2"})
    
    agent = StartupRadarAgent()
    result = await agent.run()
    assert result.success is True
    assert "Startup Radar" in result.title

@pytest.mark.asyncio
async def test_research_paper_agent(mock_api, mock_llm):
    """Test Arxiv agent with XML response."""
    xml_data = '''<?xml version="1.0" encoding="UTF-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <entry>
        <title>Attention Is All You Need</title>
        <summary>The dominant sequence transduction models are based on complex recurrent...</summary>
      </entry>
    </feed>
    '''
    # The actual URL requested by the agent
    url = "https://export.arxiv.org/api/query?search_query=cat%3Acs.AI%20OR%20cat%3Acs.LG&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending"
    mock_api.set_mock_text(url, xml_data)
    
    agent = ResearchPaperAgent()
    result = await agent.run()
    
    assert isinstance(result, AgentResult)
    assert result.success is True
    assert result.title == "Latest AI Research Trends"
    assert len(result.events) > 0  # Should be 1 event plotted

@pytest.mark.asyncio
async def test_crypto_market_agent(mock_api, mock_llm):
    """Test CoinGecko agent."""
    mock_api.set_mock_response(
        "https://api.coingecko.com/api/v3/search/trending",
        {"coins": [
            {"item": {"name": "Bitcoin", "symbol": "btc", "market_cap_rank": 1}},
            {"item": {"name": "Ethereum", "symbol": "eth", "market_cap_rank": 2}}
        ]}
    )
    
    agent = MarketSignalAgent()
    result = await agent.run()
    
    assert result.success is True
    assert "Crypto Market Trend Forecast" in result.title
    assert "Mocked LLM analysis output" in result.content

@pytest.mark.asyncio
async def test_cyber_threat_agent(mock_api, mock_llm):
    """Test CVE monitor agent returning a Geo-locatable event."""
    mock_api.set_mock_response(
        "https://cve.circl.lu/api/last",
        [
            {
                "id": "CVE-2023-12345", 
                "summary": "Critical RCE in server component",
                "cvss": 9.8
            }
        ]
    )
    
    agent = CyberThreatAgent()
    result = await agent.run()
    
    assert result.success is True
    assert result.title == "Active Threat Intelligence Report"
    assert "Mocked LLM analysis output" in result.content
    assert len(result.events) > 0
    event = result.events[0]
    assert event['topic'] == "Security Vulnerability Detected"
