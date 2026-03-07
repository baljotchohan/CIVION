import pytest
from civion.engine.persona_system import persona_system

@pytest.mark.asyncio
async def test_create_and_analyze_persona():
    persona = await persona_system.create_persona(
        name="Test Persona",
        description="A test",
        system_prompt="Test prompt",
        reasoning_style="Testing",
        user_id="user_1"
    )
    
    assert persona.id is not None
    
    analysis = await persona_system.analyze_with_persona(persona.id, "some data")
    assert "Test Persona" in analysis
    
    # Check usage count increased
    updated_persona = await persona_system.get_persona(persona.id)
    assert updated_persona.usage_count == 1
