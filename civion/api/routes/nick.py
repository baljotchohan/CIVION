from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import json
import os
from pathlib import Path

router = APIRouter()

CIVION_DIR = Path.home() / ".civion"
NICK_MEMORY_FILE = CIVION_DIR / "nick_memory.json"
PROFILE_FILE = CIVION_DIR / "profile.json"

class NickLearnRequest(BaseModel):
    fact: str

def get_nick_memory():
    if not NICK_MEMORY_FILE.exists():
        return {
            "user_name": "",
            "facts": [],
            "preferences": [],
            "conversation_count": 0,
            "topics_of_interest": [],
            "last_conversation": "",
            "notable_events": []
        }
    with open(NICK_MEMORY_FILE, 'r') as f:
        return json.load(f)

def save_nick_memory(memory: dict):
    os.makedirs(CIVION_DIR, exist_ok=True)
    with open(NICK_MEMORY_FILE, 'w') as f:
        json.dump(memory, f, indent=2)

def get_user_profile():
    if not PROFILE_FILE.exists():
        return None
    with open(PROFILE_FILE, 'r') as f:
        return json.load(f)

def save_user_profile(profile: dict):
    os.makedirs(CIVION_DIR, exist_ok=True)
    with open(PROFILE_FILE, 'w') as f:
        json.dump(profile, f, indent=2)

@router.get("/memory")
async def read_nick_memory():
    return get_nick_memory()

@router.post("/memory")
async def update_nick_memory(memory: dict):
    save_nick_memory(memory)
    return {"status": "success"}

@router.post("/learn")
async def nick_learn(req: NickLearnRequest):
    memory = get_nick_memory()
    if req.fact not in memory["facts"]:
        memory["facts"].append(req.fact)
        save_nick_memory(memory)
    return {"status": "success", "learned": req.fact}

@router.get("/profile")
async def read_user_profile():
    profile = get_user_profile()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/profile")
async def update_user_profile(profile: dict):
    save_user_profile(profile)
    return {"status": "success"}
