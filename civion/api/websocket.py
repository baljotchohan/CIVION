import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Set, Any
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    """Manages WebSocket connections and broadcasts events"""
    
    def __init__(self):
        # Maps websocket to a set of event types they are subscribed to
        # An empty set means they receive all events (default)
        self.active_connections: Dict[WebSocket, Set[str]] = {}
        self.event_history: List[Dict[str, Any]] = []
        self.max_history = 1000
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        async with self._lock:
            self.active_connections[websocket] = set()
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "timestamp": datetime.now().isoformat(),
            "event_id": str(uuid.uuid4())
        })
    
    async def disconnect(self, websocket: WebSocket):
        """Remove disconnected client"""
        async with self._lock:
            if websocket in self.active_connections:
                del self.active_connections[websocket]
            
    async def subscribe(self, websocket: WebSocket, events: List[str]):
        """Subscribe a client to specific events"""
        async with self._lock:
            if websocket in self.active_connections:
                for event in events:
                    self.active_connections[websocket].add(event)
                
    async def unsubscribe(self, websocket: WebSocket, events: List[str]):
        """Unsubscribe a client from specific events"""
        async with self._lock:
            if websocket in self.active_connections:
                for event in events:
                    self.active_connections[websocket].discard(event)
    
    async def broadcast(self, event_type: str, data: dict):
        """Broadcast event to all connected clients based on subscriptions"""
        
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat(),
            "event_id": str(uuid.uuid4())
        }
        
        async with self._lock:
            # Store in history
            self.event_history.append(event)
            if len(self.event_history) > self.max_history:
                self.event_history = self.event_history[-self.max_history:]
            
            # Broadcast to all subscribed clients
            disconnected = []
            for connection, subscriptions in self.active_connections.items():
                # Filter events based on subscriptions. Empty set = all events
                if subscriptions and event_type not in subscriptions and "all" not in subscriptions:
                    continue
                    
                try:
                    await connection.send_json(event)
                except Exception:
                    disconnected.append(connection)
            
            # Clean up disconnected
            for conn in disconnected:
                if conn in self.active_connections:
                    del self.active_connections[conn]
    
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
    "agent_stopped": True,
    "agent_error": True,
    "agent_finished": True,
    "signal_detected": True,
    "insight_generated": True,
    "network_signal_received": True,
    "persona_created": True,
    "goal_created": True,
    "goal_executed": True,
}
