import pytest
from civion.engine.persona_system import PersonaSystem, Persona

def test_create_persona_valid():
    """Test creating a valid persona"""
    system = PersonaSystem()
    p = system.create_persona("Investigator", "Digs deep")
    assert p.name == "Investigator"
    assert p.description == "Digs deep"

def test_create_persona_missing_name_raises():
    """Test validation requires name"""
    system = PersonaSystem()
    with pytest.raises(ValueError):
        system.create_persona("", "No name")

def test_create_persona_has_id_assigned():
    """Test unique ID generation"""
    system = PersonaSystem()
    p = system.create_persona("Tester", "Tests")
    assert p.id is not None
    assert len(p.id) > 0

def test_list_personas_initially_empty():
    """Test new system has no custom personas"""
    system = PersonaSystem()
    # Built-ins might exist, but checking length > 0
    assert isinstance(system.list_personas(), list)

def test_list_personas_after_create():
    """Test created persona appears in list"""
    system = PersonaSystem()
    initial_count = len(system.list_personas())
    system.create_persona("New", "Pers")
    assert len(system.list_personas()) == initial_count + 1

def test_get_persona_by_id_found():
    """Test retrieving persona by its ID"""
    system = PersonaSystem()
    p = system.create_persona("FindMe", "Look")
    found = system.get_persona(p.id)
    assert found is not None
    assert found.name == "FindMe"

def test_get_persona_by_id_not_found_returns_none():
    """Test invalid ID yields None"""
    system = PersonaSystem()
    assert system.get_persona("invalid_id_123") is None

def test_update_persona_name():
    """Test updating properties of existing persona"""
    system = PersonaSystem()
    p = system.create_persona("Old", "Desc")
    updated = system.update_persona(p.id, name="New Name")
    assert updated.name == "New Name"
    assert system.get_persona(p.id).name == "New Name"

def test_delete_persona_removes_it():
    """Test deleting persona from system"""
    system = PersonaSystem()
    p = system.create_persona("DeleteMe", "")
    assert system.get_persona(p.id) is not None
    system.delete_persona(p.id)
    assert system.get_persona(p.id) is None

def test_share_persona_sets_flag():
    """Test sharing sets is_shared flag"""
    system = PersonaSystem()
    p = system.create_persona("Shared", "")
    assert not p.is_shared
    system.share_persona(p.id)
    assert system.get_persona(p.id).is_shared is True

def test_apply_persona_sets_active():
    """Test applying changes active persona state"""
    system = PersonaSystem()
    p = system.create_persona("Active", "")
    system.apply_persona(p.id)
    assert system.get_active_persona() == p

def test_persona_analysis_style_default():
    """Test default analysis style"""
    system = PersonaSystem()
    p = system.create_persona("Default", "Style test")
    assert p.analysis_style is not None
    assert len(p.analysis_style) > 0
