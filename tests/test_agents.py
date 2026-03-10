"""Test agents"""
import pytest
import asyncio
from civion.agents import GitHubAgent, ResearchAgent, MarketAgent

@pytest.mark.asyncio
async def test_github_agent():
    """Test GitHub agent"""
    agent = GitHubAgent()
    result = await agent.analyze("python")
    
    assert result['agent'] == "GitHubAgent"
    assert 'analysis' in result
    assert 0 <= result['confidence'] <= 1
    assert 'data' in result

@pytest.mark.asyncio
async def test_research_agent():
    """Test research agent"""
    agent = ResearchAgent()
    result = await agent.analyze("machine learning")
    
    assert result['agent'] == "ResearchAgent"
    assert 'analysis' in result
    assert 0 <= result['confidence'] <= 1

@pytest.mark.asyncio
async def test_market_agent():
    """Test market agent"""
    agent = MarketAgent()
    # Market agent requires NEWSAPI_KEY, if not set it might return fallback
    result = await agent.analyze("AI")
    
    assert result['agent'] == "MarketAgent"
    assert 'analysis' in result
    assert 0 <= result['confidence'] <= 1

@pytest.mark.asyncio
async def test_agents_parallel():
    """Test running agents in parallel"""
    agents = [GitHubAgent(), ResearchAgent(), MarketAgent()]
    results = await asyncio.gather(*[a.analyze("test") for a in agents], return_exceptions=True)
    
    assert len(results) == 3
    # Check that at least we get dictionaries back (or exceptions which we can inspect)
    for r in results:
        if isinstance(r, Exception):
            pytest.fail(f"Agent failed with exception: {r}")
        assert 'agent' in r
