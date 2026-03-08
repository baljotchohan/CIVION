import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from civion.engine.reasoning_pipeline import ReasoningPipeline
from civion.api.websocket import manager

@pytest.fixture
def pipeline():
    return ReasoningPipeline()

@pytest.mark.asyncio
async def test_pipeline_creates_loop_from_goal(pipeline):
    """Test starting a goal creates a new tracking loop"""
    loop_id = await pipeline.start_goal("Find tech trends")
    assert loop_id is not None
    assert loop_id in pipeline.active_loops

@pytest.mark.asyncio
@patch("civion.services.llm_service.LLMService.complete", new_callable=AsyncMock)
async def test_pipeline_adds_proposer_argument(mock_llm, pipeline):
    """Test initial proposer flow"""
    mock_llm.return_value = "Proposer thesis"
    manager.broadcast = AsyncMock()
    loop_id = await pipeline.start_goal("Find trends")
    await pipeline.run_round((loop_id, pipeline.active_loops[loop_id]))
    
    loop = pipeline.active_loops[loop_id]
    assert len(loop.history) >= 1
    assert loop.history[0]["action"] == "propose"

@pytest.mark.asyncio
@patch("civion.services.llm_service.LLMService.complete", new_callable=AsyncMock)
async def test_pipeline_adds_challenger_argument(mock_llm, pipeline):
    """Test challenger reacts to proposal"""
    mock_llm.return_value = "Challenge argument"
    loop_id = await pipeline.start_goal("Query")
    loop = pipeline.active_loops[loop_id]
    loop.add_argument("source", "propose", "Init")
    
    await pipeline.run_round((loop_id, loop))
    assert len(loop.history) >= 2
    assert loop.history[1]["action"] == "challenge"

@pytest.mark.asyncio
@patch("civion.services.llm_service.LLMService.complete", new_callable=AsyncMock)
async def test_pipeline_adds_verifier_argument(mock_llm, pipeline):
    """Test verifier follows challenge"""
    mock_llm.return_value = "Verification argument"
    loop_id = await pipeline.start_goal("Query")
    loop = pipeline.active_loops[loop_id]
    loop.add_argument("a1", "propose", "p")
    loop.add_argument("a2", "challenge", "c")
    
    await pipeline.run_round((loop_id, loop))
    assert loop.history[-1]["action"] in ["verify", "synthesize"]

@pytest.mark.asyncio
@patch("civion.services.llm_service.LLMService.complete", new_callable=AsyncMock)
async def test_pipeline_confidence_increases_over_rounds(mock_llm, pipeline):
    """Test confidence accumulation across multiple turns"""
    mock_llm.return_value = "Valid point"
    loop_id = await pipeline.start_goal("Trends")
    loop = pipeline.active_loops[loop_id]
    initial = loop.get_confidence()
    
    await pipeline.run_round((loop_id, loop))
    await asyncio.sleep(0.01)
    await pipeline.run_round((loop_id, loop))
    
    assert loop.get_confidence() > initial

@pytest.mark.asyncio
@patch("civion.services.llm_service.LLMService.complete", new_callable=AsyncMock)
async def test_pipeline_reaches_consensus_threshold(mock_llm, pipeline):
    """Test pipeline automatically completes loop when confident"""
    mock_llm.return_value = "Absolute proof"
    loop_id = await pipeline.start_goal("Threshold")
    loop = pipeline.active_loops[loop_id]
    
    for _ in range(5):
        await pipeline.run_round((loop_id, loop))
        if loop.status == "completed":
            break
            
    assert loop.status == "completed"

@pytest.mark.asyncio
async def test_pipeline_stores_debate_history(pipeline):
    """Test persistence of pipeline arguments"""
    loop_id = await pipeline.start_goal("Test")
    loop = pipeline.active_loops[loop_id]
    loop.add_argument("tester", "propose", "arg1")
    
    assert len(pipeline.active_loops[loop_id].history) == 1

@pytest.mark.asyncio
@patch("civion.api.websocket.manager.broadcast", new_callable=AsyncMock)
@patch("civion.services.llm_service.LLMService.complete", new_callable=AsyncMock)
async def test_pipeline_emits_websocket_events(mock_llm, mock_ws, pipeline):
    """Test WS notification of pipeline progress"""
    mock_llm.return_value = "Test response"
    loop_id = await pipeline.start_goal("WS Test")
    loop = pipeline.active_loops[loop_id]
    
    await pipeline.run_round((loop_id, loop))
    assert mock_ws.call_count > 0
