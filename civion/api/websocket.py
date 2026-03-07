from fastapi import WebSocket, WebSocketDisconnect
from typing import Set, Dict, List
import json
import asyncio
from datetime import datetime
import uuid

class ConnectionManager:
    """Manages WebSocket connections and broadcasts events"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.event_history: List[Dict] = []
        self.max_history = 1000
    
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "timestamp": datetime.now().isoformat(),
            "event_id": str(uuid.uuid4())
        })
    
    def disconnect(self, websocket: WebSocket):
        """Remove disconnected client"""
        self.active_connections.discard(websocket)
    
    async def broadcast(self, event_type: str, data: dict):
        """Broadcast event to all connected clients"""
        
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat(),
            "event_id": str(uuid.uuid4())
        }
        
        # Store in history
        self.event_history.append(event)
        if len(self.event_history) > self.max_history:
            self.event_history = self.event_history[-self.max_history:]
        
        # Broadcast to all clients
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(event)
            except Exception as e:
                disconnected.append(connection)
        
        # Clean up disconnected
        for conn in disconnected:
            self.disconnect(conn)
    
    async def send_to_user(self, websocket: WebSocket, event_type: str, data: dict):
        """Send event to specific user"""
        try:
            await websocket.send_json({
                "type": event_type,
                "data": data,
                "timestamp": datetime.now().isoformat(),
                "event_id": str(uuid.uuid4())
            })
        except Exception as e:
            print(f"Error sending to user: {e}")

# Global manager
manager = ConnectionManager()

# Events that should broadcast
BROADCAST_EVENTS = {
    "reasoning_started": True,
    "reasoning_updated": True,
    "reasoning_completed": True,
    "confidence_changed": True,
    "prediction_made": True,
    "agent_started": True,
    "agent_finished": True,
    "signal_detected": True,
    "insight_generated": True,
    "network_signal_received": True,
    "persona_created": True,
    "goal_created": True,
    "goal_executed": True,
}
