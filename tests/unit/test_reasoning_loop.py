import pytest
from civion.engine.reasoning_loop import ReasoningLoop

def test_create_loop_has_id():
    """Test new loop generates a unique ID"""
    loop = ReasoningLoop(goal="Test goal")
    assert loop.id is not None
    assert len(loop.id) > 0

def test_create_loop_initial_confidence():
    """Test default confidence on loop creation"""
    loop = ReasoningLoop(goal="Test")
    assert loop.get_confidence() == 0.0

def test_add_proposer_argument():
    """Test setting initial argument"""
    loop = ReasoningLoop(goal="Test")
    loop.add_argument("agent1", "propose", "My thesis")
    assert len(loop.history) == 1
    assert loop.history[0]["action"] == "propose"

def test_add_challenger_argument():
    """Test adding challenge argument"""
    loop = ReasoningLoop(goal="Test")
    loop.add_argument("a", "challenge", "Counter")
    assert len(loop.history) == 1
    assert loop.history[0]["action"] == "challenge"

def test_add_verifier_increases_confidence():
    """Test verification boosts confidence"""
    loop = ReasoningLoop(goal="Test")
    loop.add_argument("a1", "propose", "Info")
    initial = loop.get_confidence()
    loop.add_argument("a2", "verify", "Confirmed info")
    assert loop.get_confidence() > initial

def test_add_challenger_decreases_confidence():
    """Test challenge drops confidence"""
    loop = ReasoningLoop(goal="Test")
    loop.add_argument("a1", "propose", "Info")
    loop.add_argument("a3", "verify", "Confirmed info")
    high = loop.get_confidence()
    loop.add_argument("a2", "challenge", "Fake news")
    assert loop.get_confidence() < high

def test_add_synthesizer_finalizes_loop():
    """Test synthesis ends the loop cycle"""
    loop = ReasoningLoop(goal="Test")
    loop.add_argument("a1", "propose", "Info")
    loop.add_argument("a2", "synthesize", "Final review")
    assert loop.status == "completed"

def test_loop_status_in_progress():
    """Test initial loop status"""
    loop = ReasoningLoop(goal="Test")
    assert loop.status == "in_progress"

def test_loop_status_completed_on_consensus():
    """Test high confidence auto-completes loop"""
    loop = ReasoningLoop(goal="Test")
    for i in range(10):
        loop.add_argument(f"a{i}", "verify", "Verified truth")
        if loop.status == "completed":
            break
    assert loop.status == "completed"
    assert loop.get_confidence() >= 0.7

def test_max_rounds_completes_loop():
    """Test loop ends after configured max rounds"""
    loop = ReasoningLoop(goal="Test", max_rounds=3)
    loop.add_argument("a1", "propose", "1")
    loop.add_argument("a2", "challenge", "2")
    loop.add_argument("a3", "propose", "3")
    assert loop.status == "completed"

def test_debate_history_has_all_arguments():
    """Test complete history retention"""
    loop = ReasoningLoop(goal="Test")
    loop.add_argument("a1", "propose", "A")
    loop.add_argument("a2", "challenge", "B")
    assert len(loop.history) == 2
    assert loop.history[0]["content"] == "A"
    assert loop.history[1]["content"] == "B"

def test_confidence_never_exceeds_one():
    """Test score bounds"""
    loop = ReasoningLoop(goal="Test")
    for i in range(20):
        loop.add_argument(f"v{i}", "verify", "V")
    assert loop.get_confidence() <= 1.0

def test_confidence_never_below_zero():
    """Test score bounds"""
    loop = ReasoningLoop(goal="Test")
    for i in range(10):
        loop.add_argument(f"c{i}", "challenge", "C")
    assert loop.get_confidence() >= 0.0
