import pytest
from datetime import datetime, timezone
from civion.engine.confidence_tracker import ConfidenceTracker
from civion.models.confidence import ConfidenceHistory

@pytest.fixture
def tracker():
    return ConfidenceTracker()

def test_initialization(tracker):
    assert tracker.current_confidence == 0.5
    assert len(tracker.history) == 0

def test_add_evidence_positive(tracker):
    tracker.add_evidence(agent_name="AgentA", source="github", confidence_score=0.8, impact_weight=1.0)
    assert tracker.current_confidence > 0.5
    assert len(tracker.history) == 1
    assert tracker.history[0].agent_name == "AgentA"
    assert tracker.history[0].action == "evidence_added"

def test_add_evidence_negative(tracker):
    tracker.add_evidence(agent_name="AgentB", source="arxiv", confidence_score=0.2, impact_weight=1.0)
    assert tracker.current_confidence < 0.5

def test_recalculate(tracker):
    tracker.add_evidence(agent_name="A", source="Test", confidence_score=0.9, impact_weight=2.0)
    tracker.add_evidence(agent_name="B", source="Test", confidence_score=0.1, impact_weight=1.0)
    score_before = tracker.current_confidence
    tracker.recalculate_confidence()
    # Recalculation should maintain similar state
    assert abs(tracker.current_confidence - score_before) < 0.1

def test_get_history(tracker):
    tracker.add_evidence("A", "Test", 0.8, 1.0)
    hist = tracker.get_history()
    assert len(hist) == 1
    assert isinstance(hist[0], ConfidenceHistory)

def test_clear_history(tracker):
    tracker.add_evidence("A", "Test", 0.8, 1.0)
    tracker.clear()
    assert tracker.current_confidence == 0.5
    assert len(tracker.history) == 0

def test_multiple_evidences(tracker):
    for i in range(5):
        tracker.add_evidence(f"Agent{i}", "Test", 0.7, 1.0)
    assert len(tracker.history) == 5
    assert tracker.current_confidence > 0.7

def test_impact_weight_scaling(tracker):
    tracker.add_evidence("A", "X", 0.9, 0.1)
    val1 = tracker.current_confidence
    tracker.clear()
    tracker.add_evidence("B", "X", 0.9, 10.0)
    val2 = tracker.current_confidence
    assert val2 > val1

def test_decay_factor(tracker):
    tracker.add_evidence("A", "X", 0.9, 1.0)
    v1 = tracker.current_confidence
    tracker.apply_time_decay(days=10)
    v2 = tracker.current_confidence
    assert v2 < v1

def test_out_of_bounds_confidence(tracker):
    tracker.add_evidence("A", "X", 1.5, 1.0)
    assert tracker.current_confidence <= 1.0
    tracker.add_evidence("A", "X", -0.5, 1.0)
    assert tracker.current_confidence >= 0.0
