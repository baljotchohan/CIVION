"""
CIVION Persona System
Custom AI analysis personas with unique perspectives.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from civion.core.logger import engine_logger
from civion.services.llm_service import llm_service
from civion.utils.helpers import generate_id, now_iso
from datetime import datetime

log = engine_logger("persona_system")


@dataclass
class Persona:
    id: str = ""
    name: str = ""
    description: str = ""
    system_prompt: str = ""
    reasoning_style: str = "analytical"
    is_shared: bool = False
    created_by: str = "system"
    usage_count: int = 0
    created_at: str = ""

    def dict(self):
        return {
            "id": self.id, "name": self.name, "description": self.description,
            "system_prompt": self.system_prompt, "reasoning_style": self.reasoning_style,
            "is_shared": self.is_shared, "created_by": self.created_by,
            "usage_count": self.usage_count,
            "created_at": self.created_at,
        }


class PersonaSystem:
    """Manages custom analysis personas."""

    def __init__(self):
        self._personas: List[Persona] = []
        self._seed_defaults()

    def _seed_defaults(self):
        defaults = [
            ("Analyst", "Balanced analytical perspective", "You are an analytical intelligence analyst. Provide balanced, evidence-based assessments.", "analytical"),
            ("Optimist", "Focuses on opportunities and growth", "You are an optimistic analyst who identifies opportunities and positive trends.", "aggressive"),
            ("Skeptic", "Critical analysis with risk focus", "You are a skeptical analyst who challenges assumptions and highlights risks.", "conservative"),
        ]
        for name, desc, prompt, style in defaults:
            self._personas.append(Persona(
                id=generate_id("per"),
                name=name, description=desc,
                system_prompt=prompt, reasoning_style=style,
                is_shared=True, created_by="system",
                created_at=now_iso(),
            ))

    async def create_persona(self, name: str, description: str, **kwargs) -> Persona:
        """Create a new persona."""
        persona_id = generate_id("pers")
        
        # Flexibly handle arguments from positional-heavy tests or keyword-heavy calls
        system_prompt = kwargs.get("system_prompt", f"You are {name}, a {description} AI analyst.")
        style = kwargs.get("style", kwargs.get("reasoning_style", "analytical"))
        created_by = kwargs.get("created_by", kwargs.get("user_id", "system"))
        
        persona = Persona(
            id=persona_id,
            name=name,
            description=description,
            system_prompt=system_prompt,
            reasoning_style=style,
            created_by=created_by,
            created_at=datetime.utcnow().isoformat() + "Z"
        )
        self._personas.append(persona)
        log.info(f"Persona created: {name}")
        return persona

    async def list_personas(self) -> List[Persona]:
        return self._personas

    async def get_persona(self, persona_id: str) -> Optional[Persona]:
        return next((p for p in self._personas if p.id == persona_id), None)

    async def analyze_with_persona(self, persona_id: str, data: str) -> str:
        persona = next((p for p in self._personas if p.id == persona_id), None)
        if not persona:
            return "Persona not found"

        prompt = f"""{persona.system_prompt}

Analyze the following intelligence data:
{data}

Provide your unique perspective and analysis.
"""
        persona.usage_count += 1
        return await llm_service.complete(prompt)


# Singleton
persona_system = PersonaSystem()
