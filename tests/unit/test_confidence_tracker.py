import pytest
from civion.engine.confidence_tracker import ConfidenceTracker

def test_init_default_score():
    """Test initial confidence score is 0.0"""
    tracker = ConfidenceTracker()
    assert tracker.get_score() == 0.0

def test_update_increases_confidence():
    """Test standard update increases score"""
    tracker = ConfidenceTracker()
    tracker.update_score("agent_1", "propose", "initial evidence")
    assert tracker.get_score() > 0.0

def test_update_decreases_confidence_on_challenge():
    """Test challenge decreases score"""
    tracker = ConfidenceTracker()
    tracker.update_score("agent_1", "propose", "evidence")
    initial = tracker.get_score()
    tracker.update_score("agent_2", "challenge", "counter evidence")
    assert tracker.get_score() < initial

def test_confidence_capped_at_one():
    """Test confidence cannot exceed 1.0"""
    tracker = ConfidenceTracker()
    for i in range(20):
        tracker.update_score(f"verify_agent_{i}", "verify", "solid proof")
    assert tracker.get_score() <= 1.0

def test_confidence_floor_at_zero():
    """Test confidence cannot fall below 0.0"""
    tracker = ConfidenceTracker()
    tracker.update_score("agent_1", "challenge", "negative proof")
    assert tracker.get_score() >= 0.0

def test_history_records_each_update():
    """Test history list grows with each update"""
    tracker = ConfidenceTracker()
    tracker.update_score("agent_1", "propose", "e1")
    tracker.update_score("agent_2", "challenge", "e2")
    assert len(tracker.history) == 2

def test_history_preserves_order():
    """Test history retains chronological order"""
    tracker = ConfidenceTracker()
    tracker.update_score("a1", "propose", "1")
    tracker.update_score("a2", "verify", "2")
    assert tracker.history[0]["action"] == "propose"
    assert tracker.history[1]["action"] == "verify"

def test_history_includes_agent_name():
    """Test history entry contains correct agent name"""
    tracker = ConfidenceTracker()
    tracker.update_score("tester", "propose", "e")
    assert tracker.history[0]["agent"] == "tester"

def test_history_includes_action():
    """Test action type is saved"""
    tracker = ConfidenceTracker()
    tracker.update_score("a", "verify", "ok")
    assert tracker.history[0]["action"] == "verify"

def test_history_includes_reason():
    """Test string reason is saved"""
    tracker = ConfidenceTracker()
    tracker.update_score("a", "propose", "because")
    assert tracker.history[0]["reason"] == "because"

def test_cascade_multiple_agents_sequential():
    """Test complex debate sequence cascades correctly"""
    tracker = ConfidenceTracker()
    tracker.update_score("a1", "propose", "t1")
    tracker.update_score("a2", "challenge", "t2")
    tracker.update_score("a3", "verify", "t3")
    tracker.update_score("a4", "synthesize", "t4")
    assert len(tracker.history) == 4
    assert 0.0 <= tracker.get_score() <= 1.0

def test_reset_returns_to_default():
    """Test reset clears score and history"""
    tracker = ConfidenceTracker()
    tracker.update_score("a", "propose", "e")
    tracker.reset()
    assert tracker.get_score() == 0.0
    assert len(tracker.history) == 0

def test_get_current_score_after_updates():
    """Test get score returns current internal value directly"""
    tracker = ConfidenceTracker()
    tracker.update_score("a", "propose", "e")
    current = tracker.get_score()
    assert current == tracker.score
