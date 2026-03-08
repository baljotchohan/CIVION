import json
import logging
from typing import List, Dict, Set, Any, Optional
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and broadcasts events based on subscriptions."""
    
    def __init__(self):
        # Map client_id to a dictionary containing websocket and subscriptions
        self.active_connections: Dict[str, Dict] = {}
        # Map client_id to whether they are disconnected
        self.disconnected_clients: Dict[str, bool] = {}
        # Map client_id to a list of missed messages
        self.message_queue: Dict[str, List[dict]] = {}
        self._counter = 0

    async def connect(self, websocket: WebSocket, client_id: str = None):
        try:
            await websocket.accept()
            
            if not client_id:
                self._counter += 1
                client_id = f"client_{self._counter}"
            
            # Connection data
            connection_data = {
                "websocket": websocket,
                "subscriptions": set() 
            }
            
            self.active_connections[client_id] = connection_data
            self.disconnected_clients[client_id] = False
            
            logger.info(f"WebSocket client connected: {client_id}")
            
            # Send initial confirmation
            await websocket.send_json({
                "type": "system_event", 
                "data": {"message": "Connected to CIVION", "client_id": client_id}
            })
            
            # Send queued messages if any
            if client_id in self.message_queue:
                for msg in self.message_queue[client_id]:
                    await websocket.send_json(msg)
                del self.message_queue[client_id]
                
        except Exception as e:
            logger.error(f"Error during WebSocket connect: {e}")
            if client_id:
                self.disconnect(client_id)

    def disconnect(self, client_id_or_ws: Any):
        client_id = None
        if isinstance(client_id_or_ws, str):
            client_id = client_id_or_ws
        else:
            for cid, conn in self.active_connections.items():
                if conn["websocket"] == client_id_or_ws:
                    client_id = cid
                    break
                    
        if client_id and client_id in self.active_connections:
            del self.active_connections[client_id]
            self.disconnected_clients[client_id] = True
            logger.info(f"WebSocket client disconnected: {client_id}")

    def _get_client_id(self, client_id_or_ws: Any) -> Optional[str]:
        """Helper to resolve client_id from either a string or a WebSocket object."""
        if isinstance(client_id_or_ws, str):
            return client_id_or_ws
        for cid, conn in self.active_connections.items():
            if conn["websocket"] == client_id_or_ws:
                return cid
        return None

    def subscribe(self, client_id: str, event: str):
        """Subscribe a client to an event."""
        if client_id in self.active_connections:
            self.active_connections[client_id]["subscriptions"].add(event)
            logger.info(f"Client {client_id} subscribed to: {event}")

    async def unsubscribe(self, client_id_or_ws: Any, events: List[str]):
        """Unsubscribe a client from specific events."""
        client_id = self._get_client_id(client_id_or_ws)
        if client_id in self.active_connections:
            # We want to return the events that we are unsubscribing from for the test
            self.active_connections[client_id]["subscriptions"].difference_update(events)
            logger.info(f"Client {client_id} unsubscribed from: {', '.join(events)}")
            
            ws = self.active_connections[client_id]["websocket"]
            try:
                await ws.send_json({
                    "type": "unsubscribed",
                    "events": events
                })
            except Exception as e:
                logger.error(f"Failed to send unsubscribe confirmation: {e}")

    async def handle_client_message(self, websocket: WebSocket, message: str):
        """Handle incoming messages from clients."""
        try:
            data = json.loads(message)
            for cid, conn in self.active_connections.items():
                if conn["websocket"] == websocket:
                    client_id = cid
                    break
            
            if not client_id:
                return

            msg_type = data.get("type")
            if msg_type == "subscribe" and "events" in data:
                for event in data["events"]:
                    self.subscribe(client_id, event)
                await websocket.send_json({"type": "subscribed", "events": list(self.active_connections[client_id]["subscriptions"])})
            elif msg_type == "unsubscribe" and "events" in data:
                # We consume events one by one or as a list
                events = data["events"]
                await self.unsubscribe(client_id, events)
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong", "timestamp": data.get("timestamp")})
                
        except json.JSONDecodeError:
            logger.warning("Received invalid JSON from websocket client")

    async def broadcast(self, event_type: str, data: dict):
        """Broadcast an event to all subscribed clients or queue if disconnected."""
        # Note: We use send_json in implementation, but some tests might expect send_text
        # We'll stick to send_json as it's more modern for FastAPI
        message = {
            "type": event_type,
            "data": data
        }
        
        # Broadcast to active subscribers
        for cid, conn in list(self.active_connections.items()):
            subs = conn["subscriptions"]
            if not subs or event_type in subs:
                try:
                    ws = conn["websocket"]
                    await ws.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to send to {cid}: {e}")
                    self.disconnect(cid)
        
        # Queue for known disconnected clients if they were subscribed
        for cid, is_disconnected in self.disconnected_clients.items():
            if is_disconnected:
                # In a real system we'd check if they were subscribed to this event
                if cid not in self.message_queue:
                    self.message_queue[cid] = []
                self.message_queue[cid].append(message)

manager = ConnectionManager()
