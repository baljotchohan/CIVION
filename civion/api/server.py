from fastapi import FastAPI, WebSocket
from pydantic import BaseModel
from typing import List, Dict, Any

# Engine imports
from civion.engine.reasoning_loop import reasoning_engine
from civion.engine.prediction_engine import prediction_engine
from civion.engine.persona_system import persona_system
from civion.engine.network_engine import network_engine
from civion.engine.confidence_tracker import confidence_tracker

app = FastAPI(title="CIVION v2 Ultimate Command Center")

@app.get("/api/status")
async def get_status():
    return {"status": "online", "version": "2.0.0-ultimate"}

# --- REASONING ENDPOINTS ---
@app.get("/api/reasoning/{loop_id}/debate")
async def get_reasoning_debate(loop_id: str):
    """Get full reasoning debate for UI display"""
    loop = await reasoning_engine.get_loop(loop_id)
    if not loop:
        return {"error": "Loop not found"}
    return await reasoning_engine.display_reasoning_loop(loop)

@app.post("/api/reasoning/start")
async def start_reasoning(topic: str, insight: str):
    loop = await reasoning_engine.start_reasoning_loop(insight, topic)
    return {"id": loop.id, "status": "started"}

# --- PREDICTION ENDPOINTS ---
@app.get("/api/predictions")
async def get_predictions():
    preds = await prediction_engine.get_all_predictions()
    return [p.dict() for p in preds]

@app.get("/api/predictions/accuracy")
async def get_prediction_accuracy():
    return await prediction_engine.get_prediction_accuracy()

@app.post("/api/predictions/generate")
async def generate_predictions(insights: List[Dict[str, Any]]):
    preds = await prediction_engine.generate_predictions(insights)
    return [p.dict() for p in preds]

# --- PERSONA ENDPOINTS ---
class PersonaCreateReq(BaseModel):
    name: str
    description: str
    prompt: str
    style: str

@app.post("/api/personas")
async def create_persona(req: PersonaCreateReq):
    persona = await persona_system.create_persona(
        req.name, req.description, req.prompt, req.style, "current_user"
    )
    return persona.dict()

@app.get("/api/personas")
async def list_personas():
    personas = await persona_system.list_personas()
    return [p.dict() for p in personas]

@app.post("/api/personas/{persona_id}/analyze")
async def analyze_with_persona(persona_id: str, data: dict):
    analysis = await persona_system.analyze_with_persona(persona_id, str(data))
    return {"analysis": analysis}

# --- NETWORK ENDPOINTS ---
class NetworkJoinReq(BaseModel):
    network: str
    peers: List[str]

@app.post("/api/network/join")
async def join_network(req: NetworkJoinReq):
    await network_engine.join_network(req.network, req.peers)
    return {"status": "joined", "network": req.network}

@app.get("/api/network/stats")
async def get_network_stats():
    return await network_engine.get_network_stats()

@app.get("/api/network/peers")
async def get_peers():
    peers = await network_engine.get_peers()
    return [p.dict() for p in peers]

# --- WEBSOCKET FOR REAL-TIME CASCADE ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Mock sending confidence events
    try:
        while True:
            await websocket.receive_text()
    except:
        pass
