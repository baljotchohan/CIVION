import json
import logging
from typing import List, Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and broadcasts events based on subscriptions."""
    
    def __init__(self):
        # Map websocket object to a simple dictionary containing client_id and subscriptions
        self.active_connections: List[Dict] = []
        self._counter = 0

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self._counter += 1
        client_id = f"client_{self._counter}"
        
        connection_data = {
            "websocket": websocket,
            "client_id": client_id,
            "subscriptions": set() # Empty means receive all by default until subscribe sent, or explicit. Usually we start receiving all, but prompt implies explicit. We'll default to all for safety, but respect subscriptions if provided.
        }
        self.active_connections.append(connection_data)
        logger.info(f"WebSocket client connected: {client_id}")
        
        # Send initial confirmation
        await websocket.send_text(json.dumps({"type": "connected", "client_id": client_id}))

    def disconnect(self, websocket: WebSocket):
        connection_to_remove = None
        for conn in self.active_connections:
            if conn["websocket"] == websocket:
                connection_to_remove = conn
                break
                
        if connection_to_remove:
            self.active_connections.remove(connection_to_remove)
            logger.info(f"WebSocket client disconnected: {connection_to_remove['client_id']}")

    async def handle_client_message(self, websocket: WebSocket, message: str):
        """Handle incoming messages from clients (like subscription requests)."""
        try:
            data = json.loads(message)
            if data.get("type") == "subscribe" and "events" in data:
                events = data["events"]
                for conn in self.active_connections:
                    if conn["websocket"] == websocket:
                        conn["subscriptions"] = set(events)
                        logger.info(f"Client {conn['client_id']} subscribed to: {events}")
                        break
        except json.JSONDecodeError:
            logger.warning("Received invalid JSON from websocket client")

    async def broadcast(self, event_type: str, data: dict):
        """
        Broadcast an event to all connected clients that are subscribed to it.
        If a client has NO subscriptions listed, they receive everything to maintain backwards compatibility.
        """
        message = json.dumps({
            "type": event_type,
            "data": data
        })
        
        failed_connections = []
        
        for conn in self.active_connections:
            ws = conn["websocket"]
            subs = conn["subscriptions"]
            
            # Send if they have no explicit subscriptions (receive all) OR if they explicitly subscribed
            if not subs or event_type in subs:
                try:
                    await ws.send_text(message)
                except Exception as e:
                    logger.error(f"Failed to send to {conn['client_id']}: {e}")
                    failed_connections.append(ws)
                    
        # Cleanup failed connections
        for ws in failed_connections:
            self.disconnect(ws)

manager = ConnectionManager()
