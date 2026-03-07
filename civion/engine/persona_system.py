import uuid
from typing import List, Dict
from datetime import datetime
from civion.models.persona import Persona

class PersonaSystem:
    """Manages custom personas"""
    def __init__(self):
        self._personas: Dict[str, Persona] = {}
        self._seed_defaults()

    def _seed_defaults(self):
        p = Persona(
            id=f"persona_{uuid.uuid4().hex[:12]}",
            name="Shakespeare Agent",
            description="Analyzes technology like poetry",
            system_prompt="You are Shakespeare. Describe technology using poetic metaphor.",
            reasoning_style="Creative/Poetic",
            created_by="system",
            usage_count=47,
            shared=True
        )
        self._personas[p.id] = p

    async def create_persona(
        self, 
        name: str, 
        description: str, 
        system_prompt: str,
        reasoning_style: str,
        user_id: str
    ) -> Persona:
        """Create a custom persona"""
        persona = Persona(
            id=f"persona_{uuid.uuid4().hex[:12]}",
            name=name,
            description=description,
            system_prompt=system_prompt,
            reasoning_style=reasoning_style,
            created_by=user_id,
            created_at=datetime.now()
        )
        self._personas[persona.id] = persona
        return persona
    
    async def get_persona(self, persona_id: str) -> Persona:
        return self._personas.get(persona_id)

    async def list_personas(self) -> List[Persona]:
        return list(self._personas.values())
    
    async def analyze_with_persona(self, persona_id: str, data: str) -> str:
        """Analyze data through specific persona lens"""
        persona = await self.get_persona(persona_id)
        if not persona:
            return "Persona not found."
        
        # Mock LLM generation using persona's system prompt
        analysis = f"[{persona.name} Analysis]: Based on my {persona.reasoning_style} perspective, {data}..."
        
        persona.usage_count += 1
        return analysis
    
    async def get_all_perspectives(self, data: str, user_personas: List[str]) -> Dict:
        """Analyze data through all user's personas"""
        perspectives = {}
        for pid in user_personas:
            p = await self.get_persona(pid)
            if p:
                perspectives[p.name] = await self.analyze_with_persona(pid, data)
        return perspectives

persona_system = PersonaSystem()
