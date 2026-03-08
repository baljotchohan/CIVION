from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import json
import os
import shutil
from pathlib import Path
from tempfile import NamedTemporaryFile
from fastapi.responses import FileResponse

router = APIRouter()

CIVION_DIR = Path.home() / ".civion"
VAULT_DIR = CIVION_DIR / "vault"

def ensure_vault_dir():
    os.makedirs(VAULT_DIR, exist_ok=True)

class VaultEntry(BaseModel):
    id: str
    type: str # 'signal'|'prediction'|'debate'|'insight'|'file'
    title: str
    content: Any
    source: str
    agent: str
    timestamp: str
    tags: List[str]
    saved: bool
    file_path: Optional[str] = None

@router.get("")
async def list_vault_items(
    type: Optional[str] = None, 
    limit: int = Query(50, ge=1, le=100), 
    offset: int = Query(0, ge=0)
):
    ensure_vault_dir()
    entries = []
    
    # Simple JSON-based vault reading
    for filename in os.listdir(VAULT_DIR):
        if not filename.endswith('.json'):
            continue
        filepath = VAULT_DIR / filename
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                if type and data.get("type") != type:
                    continue
                entries.append(data)
        except Exception:
            pass
            
    # Sort by timestamp desc
    entries.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Paginate
    paginated = entries[offset:offset+limit]
    
    return {
        "items": paginated,
        "total": len(entries),
        "limit": limit,
        "offset": offset
    }

@router.post("")
async def save_vault_item(entry: VaultEntry):
    ensure_vault_dir()
    filepath = VAULT_DIR / f"{entry.id}.json"
    with open(filepath, 'w') as f:
        json.dump(entry.dict(), f, indent=2)
    return {"status": "success", "id": entry.id}

@router.delete("/{item_id}")
async def delete_vault_item(item_id: str):
    filepath = VAULT_DIR / f"{item_id}.json"
    if filepath.exists():
        os.remove(filepath)
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Item not found")

@router.get("/export")
async def export_vault():
    ensure_vault_dir()
    # Create zip file of vault contents
    temp_zip = NamedTemporaryFile(delete=False, suffix='.zip')
    temp_zip.close()
    
    # Don't include the .zip extension in base_name for shutil.make_archive
    base_name = temp_zip.name[:-4] 
    shutil.make_archive(base_name, 'zip', VAULT_DIR)
    
    return FileResponse(
        temp_zip.name, 
        media_type="application/zip", 
        filename="civion_vault_export.zip"
    )
