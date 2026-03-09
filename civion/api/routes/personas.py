"""Persona API routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
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
async def list_personas(style: Optional[str] = None):
    """List all personas with optional style filtering."""
    personas = await persona_system.list_personas()
    results = [p.dict() if hasattr(p, 'dict') else p for p in personas]
    if style:
        results = [p for p in results if p.get("style") == style]
    return results


@router.post("")
async def create_persona(req: PersonaCreate):
    """Create a new persona."""
    persona = await persona_system.create_persona(
        name=req.name,
        description=req.description,
        system_prompt=req.prompt,
        reasoning_style=req.style,
        created_by="api_user"
    )
    return persona.dict() if hasattr(persona, 'dict') else persona


@router.get("/{persona_id}")
async def get_persona(persona_id: str):
    """Get persona details."""
    p = await persona_system.get_persona(persona_id)
    if not p:
        raise HTTPException(404, "Persona not found")
    return p.dict() if hasattr(p, 'dict') else p


@router.put("/{persona_id}")
async def update_persona(persona_id: str, req: PersonaUpdate):
    """Update a persona."""
    p = await persona_system.update_persona(persona_id, **req.dict(exclude_unset=True))
    if not p:
        raise HTTPException(404, "Persona not found")
    return p.dict() if hasattr(p, 'dict') else p


@router.delete("/{persona_id}")
async def delete_persona(persona_id: str):
    """Delete a persona."""
    success = await persona_system.delete_persona(persona_id)
    if not success:
        raise HTTPException(404, "Persona not found")
    return {"id": persona_id, "deleted": True}


@router.post("/{persona_id}/analyze")
async def analyze_with_persona(persona_id: str, data: dict):
    """Analyze data using a specific persona."""
    analysis = await persona_system.analyze_with_persona(persona_id, str(data))
    return {"persona_id": persona_id, "analysis": analysis}


@router.post("/{persona_id}/share")
async def share_persona(persona_id: str):
    """Share a persona with the community (sets 'shared' flag)."""
    success = await persona_system.share_persona(persona_id)
    if not success:
        raise HTTPException(404, "Persona not found")
    return {"id": persona_id, "shared": True, "status": "published"}


@router.get("/{persona_id}/usage")
async def get_persona_usage(persona_id: str):
    """Get usage statistics for a persona."""
    return {"persona_id": persona_id, "total_calls": 0, "avg_confidence": 0.8}
