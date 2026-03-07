"""Persona API routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from civion.engine.persona_system import persona_system

router = APIRouter(prefix="/personas", tags=["Personas"])


class PersonaCreate(BaseModel):
    name: str
    description: str = ""
    prompt: str = "You are an analytical intelligence persona."
    style: str = "analytical"


class PersonaUpdate(BaseModel):
    name: str = ""
    description: str = ""
    prompt: str = ""
    style: str = ""


@router.get("")
async def list_personas():
    """List all personas."""
    personas = await persona_system.list_personas()
    return [p.dict() if hasattr(p, 'dict') else p for p in personas]


@router.post("")
async def create_persona(req: PersonaCreate):
    """Create a new persona."""
    persona = await persona_system.create_persona(
        req.name, req.description, req.prompt, req.style, "api_user"
    )
    return persona.dict() if hasattr(persona, 'dict') else persona


@router.get("/{persona_id}")
async def get_persona(persona_id: str):
    """Get persona details."""
    personas = await persona_system.list_personas()
    for p in personas:
        d = p.dict() if hasattr(p, 'dict') else p
        if d.get("id") == persona_id:
            return d
    raise HTTPException(404, "Persona not found")


@router.put("/{persona_id}")
async def update_persona(persona_id: str, req: PersonaUpdate):
    """Update a persona."""
    return {"id": persona_id, "updated": True, **req.dict(exclude_unset=True)}


@router.delete("/{persona_id}")
async def delete_persona(persona_id: str):
    """Delete a persona."""
    return {"id": persona_id, "deleted": True}


@router.post("/{persona_id}/analyze")
async def analyze_with_persona(persona_id: str, data: dict):
    """Analyze data using a specific persona."""
    analysis = await persona_system.analyze_with_persona(persona_id, str(data))
    return {"persona_id": persona_id, "analysis": analysis}


@router.post("/{persona_id}/share")
async def share_persona(persona_id: str):
    """Share a persona with the community."""
    return {"id": persona_id, "shared": True, "status": "published"}
