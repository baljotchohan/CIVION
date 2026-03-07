import pytest
from civion.engine.prediction_engine import prediction_engine

@pytest.mark.asyncio
async def test_generate_predictions():
    insights = [{"content": "Data point 1"}]
    preds = await prediction_engine.generate_predictions(insights)
    
    assert len(preds) > 0
    assert preds[0].confidence > 0.0

@pytest.mark.asyncio
async def test_verify_prediction():
    insights = [{"content": "Data point 1"}]
    preds = await prediction_engine.generate_predictions(insights)
    pred_id = preds[0].id
    
    await prediction_engine.verify_prediction(pred_id, True)
    
    accuracy = await prediction_engine.get_prediction_accuracy()
    assert accuracy["total"] > 0
