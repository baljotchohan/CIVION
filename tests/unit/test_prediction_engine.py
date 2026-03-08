import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from civion.engine.prediction_engine import PredictionEngine

@pytest.fixture
def pred_engine():
    return PredictionEngine()

@pytest.mark.asyncio
async def test_pred_init(pred_engine):
    assert len(pred_engine.predictions) == 0

@pytest.mark.asyncio
async def test_analyze_no_context(pred_engine):
    res = await pred_engine.analyze("Test Goal")
    assert len(res) == 1
    assert "Test Goal" in res[0]["title"]
    assert res[0]["probability"] == 0.65
    assert len(pred_engine.predictions) == 1

@pytest.mark.asyncio
async def test_analyze_with_context(pred_engine):
    context = [{"id": "1"}, {"id": "2"}]
    res = await pred_engine.analyze("Goal", context)
    assert res[0]["probability"] == 0.75

@pytest.mark.asyncio
async def test_analyze_context_cap(pred_engine):
    context = [{"id": str(i)} for i in range(20)]
    res = await pred_engine.analyze("Goal", context)
    # Prob increases by 0.05 per item, capped at 0.98
    assert res[0]["probability"] == 0.98

@pytest.mark.asyncio
async def test_analyze_broadcasts(pred_engine):
    with patch("civion.engine.prediction_engine.manager.broadcast", new_callable=AsyncMock) as mock_broadcast:
        res = await pred_engine.analyze("Goal")
        mock_broadcast.assert_called_once_with("prediction_made", res[0])

@pytest.mark.asyncio
async def test_get_all_predictions(pred_engine):
    await pred_engine.analyze("Goal 1")
    await pred_engine.analyze("Goal 2")
    preds = await pred_engine.get_all_predictions()
    assert len(preds) == 2

@pytest.mark.asyncio
async def test_get_all_ordering(pred_engine):
    await pred_engine.analyze("Goal 1")
    await asyncio.sleep(0.01)
    await pred_engine.analyze("Goal 2")
    preds = await pred_engine.get_all_predictions()
    assert "Goal 2" in preds[0]["title"]

@pytest.mark.asyncio
async def test_resolve_success(pred_engine):
    res = await pred_engine.analyze("Goal")
    pred_id = res[0]["id"]
    
    resolved = await pred_engine.resolve_prediction(pred_id, outcome=True, accuracy=95.5)
    assert resolved["resolved"] is True
    assert resolved["outcome"] is True
    assert resolved["accuracy"] == 95.5

@pytest.mark.asyncio
async def test_resolve_not_found(pred_engine):
    resolved = await pred_engine.resolve_prediction("ghost_id", outcome=True, accuracy=95.5)
    assert resolved is None

@pytest.mark.asyncio
async def test_prediction_id_prefix(pred_engine):
    res = await pred_engine.analyze("Goal")
    assert res[0]["id"].startswith("pred_")

@pytest.mark.asyncio
async def test_prediction_defaults(pred_engine):
    res = await pred_engine.analyze("Goal")
    assert res[0]["resolved"] is False
    assert res[0]["outcome"] is None
    assert res[0]["shared_count"] == 0

@pytest.mark.asyncio
async def test_prediction_evidence_population(pred_engine):
    context = [{"id": "s1"}]
    res = await pred_engine.analyze("Goal", context)
    assert len(res[0]["evidence"]) == 2
    assert "active network signals" in res[0]["evidence"][1]
