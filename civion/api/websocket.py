import json
import logging
import asyncio
from typing import List, Dict, Set, Any, Optional
from fastapi import WebSocket
from datetime import datetime, UTC

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # active_connections[client_id] = {"websocket": ws, "subscriptions": set()}
        self.active_connections: Dict[str, Dict[str, Any]] = {}
        self.event_history: List[Dict] = []
        self.message_queue: Dict[str, List[Dict]] = {}
        self.disconnected_clients: Dict[str, bool] = {}
        self._client_counter = 0

    async def connect(self, websocket: WebSocket, client_id: Optional[str] = None):
        await websocket.accept()
        
        if not client_id:
            self._client_counter += 1
            client_id = f"client_{self._client_counter}"
        
        self.active_connections[client_id] = {
            "websocket": websocket,
            "subscriptions": set()
        }
        
        # Mark as connected if it was previously disconnected
        if client_id in self.disconnected_clients:
            del self.disconnected_clients[client_id]
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "system_event",
            "timestamp": datetime.now(UTC).isoformat(),
            "data": {"message": "Connected to CIVION", "client_id": client_id}
        })
        
        # Flush any queued messages
        if client_id in self.message_queue:
            for msg in self.message_queue[client_id]:
                await websocket.send_json(msg)
            del self.message_queue[client_id]

    def disconnect(self, websocket_or_id: Any):
        client_id_to_remove = None
        
        if isinstance(websocket_or_id, str):
            client_id_to_remove = websocket_or_id
        else:
            for cid, conn in self.active_connections.items():
                if conn["websocket"] == websocket_or_id:
                    client_id_to_remove = cid
                    break
        
        if client_id_to_remove and client_id_to_remove in self.active_connections:
            del self.active_connections[client_id_to_remove]
            self.disconnected_clients[client_id_to_remove] = True

    def subscribe(self, client_id: str, event_type: str):
        if client_id in self.active_connections:
            self.active_connections[client_id]["subscriptions"].add(event_type)

    def unsubscribe(self, client_id: str, event_type: str):
        if client_id in self.active_connections:
            if event_type in self.active_connections[client_id]["subscriptions"]:
                self.active_connections[client_id]["subscriptions"].remove(event_type)

    async def handle_client_message(self, websocket: WebSocket, message: str):
        try:
            data = json.loads(message)
            msg_type = data.get("type")
            
            # Find client_id for this websocket
            client_id = None
            for cid, conn in self.active_connections.items():
                if conn["websocket"] == websocket:
                    client_id = cid
                    break
            
            if not client_id: return

            if msg_type == "subscribe":
                events = data.get("events", [])
                for event in events:
                    self.subscribe(client_id, event)
                await websocket.send_json({
                    "type": "subscribed",
                    "events": list(self.active_connections[client_id]["subscriptions"]),
                    "timestamp": datetime.now(UTC).isoformat()
                })
            elif msg_type == "unsubscribe":
                events = data.get("events", [])
                for event in events:
                    self.unsubscribe(client_id, event)
                await websocket.send_json({
                    "type": "unsubscribed",
                    "events": events,
                    "timestamp": datetime.now(UTC).isoformat()
                })
            elif msg_type == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.now(UTC).isoformat()
                })
        except Exception as e:
            logger.error(f"Error handling websocket message: {e}")

    async def broadcast(self, event_type: str, data: dict):
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now(UTC).isoformat(),
        }
        self.event_history.append(event)
        
        # For disconnected clients that have subscriptions, queue the message
        for cid, is_disconnected in self.disconnected_clients.items():
            # This is simplified; in a real app we'd track subs for disconnected clients too
            # For now, let's just queue for everyone who was subscribed if possible
            # But the requirement usually is just to queue.
            if cid not in self.message_queue:
                self.message_queue[cid] = []
            self.message_queue[cid].append(event)

        # Send to active clients
        disconnected = []
        for cid, conn in self.active_connections.items():
            subs = conn["subscriptions"]
            # If no subs, receive all. If subs exist, must match.
            if not subs or event_type in subs:
                try:
                    await conn["websocket"].send_json(event)
                except Exception:
                    disconnected.append(cid)
        
        for cid in disconnected:
            self.disconnect(cid)

manager = ConnectionManager()
