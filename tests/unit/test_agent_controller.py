import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from civion.engine.agent_engine import AgentEngine
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.core.constants import AgentState

class MockAgent(BaseAgent):
    def __init__(self, name):
        super().__init__(name, "Mock")
        self.should_fail = False

    async def scan(self):
        if self.should_fail:
            raise ValueError("Simulated error")
        return [{"data": "test"}]

    async def analyze(self, raw):
        return AgentResult(agent_name=self.name, insights=[{"title": "test insight"}])

@pytest.fixture
def engine():
    eng = AgentEngine()
    eng.register(MockAgent("AgentA"))
    eng.register(MockAgent("AgentB"))
    return eng

@pytest.mark.asyncio
async def test_register_agent(engine):
    agent = MockAgent("AgentC")
    engine.register(agent)
    assert engine.get_agent("AgentC") is agent

@pytest.mark.asyncio
async def test_get_agent_not_found(engine):
    assert engine.get_agent("Ghost") is None

@pytest.mark.asyncio
async def test_start_agent(engine):
    res = await engine.start_agent("AgentA")
    assert res["status"] == "started"
    assert engine.get_agent("AgentA").is_running is True

@pytest.mark.asyncio
async def test_start_already_running(engine):
    await engine.start_agent("AgentA")
    res = await engine.start_agent("AgentA")
    assert res["status"] == "already_running"

@pytest.mark.asyncio
async def test_start_agent_not_found(engine):
    res = await engine.start_agent("Ghost")
    assert "error" in res

@pytest.mark.asyncio
async def test_stop_agent(engine):
    await engine.start_agent("AgentA")
    res = await engine.stop_agent("AgentA")
    assert res["status"] == "stopped"
    assert engine.get_agent("AgentA").is_running is False

@pytest.mark.asyncio
async def test_stop_agent_not_found(engine):
    res = await engine.stop_agent("Ghost")
    assert "error" in res

@pytest.mark.asyncio
async def test_pause_agent(engine):
    res = await engine.pause_agent("AgentA")
    assert res["status"] == "paused"
    assert engine.get_agent("AgentA").is_running is False

@pytest.mark.asyncio
async def test_pause_agent_not_found(engine):
    res = await engine.pause_agent("Ghost")
    assert "error" in res

@pytest.mark.asyncio
async def test_resume_agent(engine):
    await engine.pause_agent("AgentA")
    res = await engine.resume_agent("AgentA")
    assert res["status"] == "running"
    assert engine.get_agent("AgentA").is_running is True

@pytest.mark.asyncio
async def test_resume_agent_not_found(engine):
    res = await engine.resume_agent("Ghost")
    assert "error" in res

@pytest.mark.asyncio
async def test_restart_agent(engine):
    await engine.start_agent("AgentA")
    res = await engine.restart_agent("AgentA")
    assert res["status"] in ["started", "already_running"]

@pytest.mark.asyncio
async def test_run_agent_cycle(engine):
    res = await engine.run_agent_cycle("AgentA")
    assert res["agent"] == "AgentA"
    assert res["insights"] == 1

@pytest.mark.asyncio
async def test_run_agent_cycle_not_found(engine):
    res = await engine.run_agent_cycle("Ghost")
    assert "error" in res

@pytest.mark.asyncio
async def test_run_agent_cycle_error(engine):
    agent = engine.get_agent("AgentA")
    agent.should_fail = True
    res = await engine.run_agent_cycle("AgentA")
    assert res["errors"] == ["Simulated error"]

@pytest.mark.asyncio
async def test_start_all(engine):
    await engine.start_all()
    assert engine.active_count == 2

@pytest.mark.asyncio
async def test_stop_all(engine):
    await engine.start_all()
    await engine.stop_all()
    assert engine.active_count == 0

@pytest.mark.asyncio
async def test_list_agents(engine):
    agents = engine.list_agents()
    assert len(agents) == 2
    assert agents[0]["name"] == "AgentA"

@pytest.mark.asyncio
async def test_get_agent_logs(engine):
    logs = engine.get_agent_logs("AgentA")
    assert "AgentA" in logs[0]

@pytest.mark.asyncio
async def test_get_stats(engine):
    stats = engine.get_stats()
    assert stats["total"] == 2
