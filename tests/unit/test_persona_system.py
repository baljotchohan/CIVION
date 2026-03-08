import pytest
from unittest.mock import patch, AsyncMock
from civion.engine.persona_system import PersonaSystem, Persona

@pytest.fixture
def persona_sys():
    return PersonaSystem()

@pytest.mark.asyncio
async def test_defaults_seeded_on_init(persona_sys):
    """Test that default personas are created."""
    personas = await persona_sys.list_personas()
    assert len(personas) >= 3
    names = [p.name for p in personas]
    assert "Analyst" in names
    assert "Optimist" in names
    assert "Skeptic" in names

@pytest.mark.asyncio
async def test_create_persona_success(persona_sys):
    """Test creating a new custom persona."""
    p = await persona_sys.create_persona("Explorer", "Finds new things")
    assert p.name == "Explorer"
    assert p.description == "Finds new things"
    assert p.id.startswith("pers_")
    assert p.created_by == "system"

@pytest.mark.asyncio
async def test_create_persona_custom_prompt_and_style(persona_sys):
    """Test creating persona with custom prompt and style."""
    p = await persona_sys.create_persona(
        "Chef", "Cooks data", 
        system_prompt="You are a data chef.", 
        style="creative"
    )
    assert p.system_prompt == "You are a data chef."
    assert p.reasoning_style == "creative"

@pytest.mark.asyncio
async def test_get_persona_found(persona_sys):
    """Test retrieving persona by ID."""
    p = await persona_sys.create_persona("Finder", "Desc")
    found = await persona_sys.get_persona(p.id)
    assert found is not None
    assert found.id == p.id

@pytest.mark.asyncio
async def test_get_persona_not_found(persona_sys):
    """Test retrieving non-existent persona returns None."""
    found = await persona_sys.get_persona("invalid")
    assert found is None

@pytest.mark.asyncio
async def test_analyze_with_persona_increments_count(persona_sys):
    """Test that analyzing increments usage_count."""
    p = await persona_sys.create_persona("Writer", "Writes")
    with patch("civion.engine.persona_system.llm_service.complete", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = "Result"
        await persona_sys.analyze_with_persona(p.id, "data")
        assert p.usage_count == 1

@pytest.mark.asyncio
async def test_analyze_with_persona_missing_returns_error(persona_sys):
    """Test error message when persona is missing."""
    result = await persona_sys.analyze_with_persona("missing", "data")
    assert result == "Persona not found"

@pytest.mark.asyncio
async def test_persona_dict_serialization(persona_sys):
    """Test persona.dict() contains required keys."""
    p = (await persona_sys.list_personas())[0]
    d = p.dict()
    assert d["id"] == p.id
    assert d["name"] == p.name
    assert "system_prompt" in d
    assert "usage_count" in d

@pytest.mark.asyncio
async def test_list_personas_returns_all(persona_sys):
    """Test listing returns both defaults and custom personas."""
    initial_count = len(await persona_sys.list_personas())
    await persona_sys.create_persona("New 1", "D")
    await persona_sys.create_persona("New 2", "D")
    all_p = await persona_sys.list_personas()
    assert len(all_p) == initial_count + 2

@pytest.mark.asyncio
async def test_analyze_calls_llm_with_prompt(persona_sys):
    """Test that LLM is called with the expected prompt structure."""
    p = (await persona_sys.list_personas())[0]
    with patch("civion.engine.persona_system.llm_service.complete", new_callable=AsyncMock) as mock_llm:
        await persona_sys.analyze_with_persona(p.id, "test data")
        called_prompt = mock_llm.call_args[0][0]
        assert p.system_prompt in called_prompt
        assert "test data" in called_prompt
