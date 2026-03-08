import pytest
import asyncio
from unittest.mock import MagicMock, AsyncMock
from civion.api.websocket import ConnectionManager
from fastapi import WebSocket

@pytest.fixture
def manager():
    return ConnectionManager()

@pytest.fixture
def mock_ws():
    ws = MagicMock(spec=WebSocket)
    ws.accept = AsyncMock()
    ws.send_text = AsyncMock()
    return ws

@pytest.mark.asyncio
async def test_connect(manager, mock_ws):
    await manager.connect(mock_ws)
    assert len(manager.active_connections) == 1
    assert manager.active_connections[0]["websocket"] == mock_ws

@pytest.mark.asyncio
async def test_connect_generates_client_id(manager, mock_ws):
    await manager.connect(mock_ws)
    assert manager.active_connections[0]["client_id"].startswith("client_")

@pytest.mark.asyncio
async def test_connect_sends_confirmation(manager, mock_ws):
    await manager.connect(mock_ws)
    assert mock_ws.send_text.called

@pytest.mark.asyncio
async def test_disconnect(manager, mock_ws):
    await manager.connect(mock_ws)
    manager.disconnect(mock_ws)
    assert len(manager.active_connections) == 0

@pytest.mark.asyncio
async def test_disconnect_not_found(manager, mock_ws):
    manager.disconnect(mock_ws)
    assert len(manager.active_connections) == 0

@pytest.mark.asyncio
async def test_handle_client_message_subscribe(manager, mock_ws):
    await manager.connect(mock_ws)
    msg = '{"type": "subscribe", "events": ["signal_detected"]}'
    await manager.handle_client_message(mock_ws, msg)
    assert "signal_detected" in manager.active_connections[0]["subscriptions"]

@pytest.mark.asyncio
async def test_handle_client_message_invalid_json(manager, mock_ws):
    await manager.connect(mock_ws)
    await manager.handle_client_message(mock_ws, "not json")
    assert len(manager.active_connections[0]["subscriptions"]) == 0

@pytest.mark.asyncio
async def test_handle_client_message_wrong_type(manager, mock_ws):
    await manager.connect(mock_ws)
    msg = '{"type": "other"}'
    await manager.handle_client_message(mock_ws, msg)
    assert len(manager.active_connections[0]["subscriptions"]) == 0

@pytest.mark.asyncio
async def test_broadcast_no_subs_receives_all(manager, mock_ws):
    await manager.connect(mock_ws)
    mock_ws.send_text.reset_mock()
    await manager.broadcast("any_event", {"data": 1})
    assert mock_ws.send_text.called

@pytest.mark.asyncio
async def test_broadcast_with_subs_match(manager, mock_ws):
    await manager.connect(mock_ws)
    await manager.handle_client_message(mock_ws, '{"type": "subscribe", "events": ["target"]}')
    mock_ws.send_text.reset_mock()
    await manager.broadcast("target", {"data": 1})
    assert mock_ws.send_text.called

@pytest.mark.asyncio
async def test_broadcast_with_subs_no_match(manager, mock_ws):
    await manager.connect(mock_ws)
    await manager.handle_client_message(mock_ws, '{"type": "subscribe", "events": ["other"]}')
    mock_ws.send_text.reset_mock()
    await manager.broadcast("target", {"data": 1})
    assert not mock_ws.send_text.called

@pytest.mark.asyncio
async def test_broadcast_multiple_clients(manager):
    ws1 = MagicMock(spec=WebSocket)
    ws1.accept = AsyncMock()
    ws1.send_text = AsyncMock()

    ws2 = MagicMock(spec=WebSocket)
    ws2.accept = AsyncMock()
    ws2.send_text = AsyncMock()

    await manager.connect(ws1)
    await manager.connect(ws2)
    
    await manager.broadcast("test", {})
    assert ws1.send_text.called
    assert ws2.send_text.called

@pytest.mark.asyncio
async def test_broadcast_disconnects_failed(manager, mock_ws):
    await manager.connect(mock_ws)
    mock_ws.send_text = AsyncMock(side_effect=RuntimeError("Failed"))
    
    await manager.broadcast("test", {})
    assert len(manager.active_connections) == 0

@pytest.mark.asyncio
async def test_internal_counter(manager, mock_ws):
    await manager.connect(mock_ws)
    manager.disconnect(mock_ws)
    ws2 = MagicMock(spec=WebSocket)
    ws2.accept = AsyncMock()
    ws2.send_text = AsyncMock()
    await manager.connect(ws2)
    assert manager.active_connections[0]["client_id"] == "client_2"

@pytest.mark.asyncio
async def test_handle_client_message_subscribe_multiple(manager, mock_ws):
    await manager.connect(mock_ws)
    msg = '{"type": "subscribe", "events": ["event_a", "event_b"]}'
    await manager.handle_client_message(mock_ws, msg)
    subs = manager.active_connections[0]["subscriptions"]
    assert "event_a" in subs
    assert "event_b" in subs
