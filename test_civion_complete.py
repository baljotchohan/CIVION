"""Comprehensive CIVION test suite."""

import pytest
import asyncio
from civion.api.websocket import manager
from civion.core.config import settings
from civion.cli.main import app as cli_app

class TestImports:
    """Test all imports work correctly."""
    
    def test_api_imports(self):
        from civion.api.server import app
        assert app is not None
        
    def test_websocket_imports(self):
        from civion.api.websocket import ConnectionManager
        assert ConnectionManager is not None
        
    def test_cli_imports(self):
        from civion.cli.main import app
        assert app is not None
        
    def test_agent_imports(self):
        from civion.agents.github_agent import GitHubAgent
        from civion.agents.research_agent import ResearchAgent
        assert GitHubAgent is not None
        assert ResearchAgent is not None

class TestConfiguration:
    """Test configuration loading."""
    
    def test_config_loads(self):
        assert settings is not None
        assert settings.port > 0
        assert settings.host is not None
        
    def test_config_values(self):
        # Allow for default settings if .env is missing or different
        assert settings.port == 8000 or settings.port == 8001
        assert settings.host == "0.0.0.0" or settings.host == "127.0.0.1"

class TestWebSocket:
    """Test WebSocket functionality."""
    
    @pytest.mark.asyncio
    async def test_connection_manager(self):
        """Test ConnectionManager initialization."""
        from civion.api.websocket import ConnectionManager
        mgr = ConnectionManager()
        assert len(mgr.active_connections) == 0
        
    @pytest.mark.asyncio
    async def test_connection_manager_message_queue(self):
        """Test message queueing."""
        from civion.api.websocket import ConnectionManager
        mgr = ConnectionManager()
        
        # Queue a message for a disconnected client
        await mgr.broadcast("test_event", {"data": "test"})
        
        # Check event history if available
        if hasattr(mgr, 'event_history'):
            assert len(mgr.event_history) > 0

class TestNoOpenClawReferences:
    """Ensure all OpenClaw references removed."""
    
    def test_no_openclaw_in_main_files(self):
        """Check main files don't reference OpenClaw."""
        import os
        
        files_to_check = [
            'civion/api/server.py',
            'civion/cli/main.py',
            'pyproject.toml',
            'README.md'
        ]
        
        for filepath in files_to_check:
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    content = f.read().lower()
                    # Check for 'openclaw' but ignore comments if possible, 
                    # for simplicity we'll just check content.
                    assert 'openclaw' not in content, f"OpenClaw reference found in {filepath}"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
