import os
import aiofiles
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class FileService:
    ALLOWED_OPERATIONS = ['read', 'write', 'create', 'list', 'delete']
    
    def __init__(self):
        self.home_dir = Path.home()
    
    def _resolve_path(self, path: str) -> Path:
        """Resolve path and ensure it's within the user's home directory."""
        resolved = Path(path).expanduser().resolve()
        if self.home_dir not in resolved.parents and resolved != self.home_dir:
            raise PermissionError("Cannot operate outside of home directory")
        return resolved
        
    async def read_file(self, path: str) -> str:
        """Read content from a file."""
        try:
            target_path = self._resolve_path(path)
            if not target_path.exists():
                raise FileNotFoundError(f"File not found: {path}")
            if not target_path.is_file():
                raise IsADirectoryError(f"Path is a directory: {path}")
                
            async with aiofiles.open(target_path, mode='r', encoding='utf-8') as f:
                return await f.read()
        except UnicodeDecodeError:
            logger.error(f"Encoding error reading {path}")
            raise ValueError(f"Cannot read {path}: Not a valid UTF-8 text file")
        except Exception as e:
            logger.error(f"Error reading {path}: {str(e)}")
            raise
            
    async def write_file(self, path: str, content: str) -> bool:
        """Write content to an existing file or create if it doesn't exist."""
        try:
            target_path = self._resolve_path(path)
            # Create parent directories if they don't exist
            target_path.parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(target_path, mode='w', encoding='utf-8') as f:
                await f.write(content)
            return True
        except Exception as e:
            logger.error(f"Error writing to {path}: {str(e)}")
            raise

    async def create_file(self, path: str, content: str = "") -> str:
        """Create a new file with optional content."""
        try:
            target_path = self._resolve_path(path)
            if target_path.exists():
                raise FileExistsError(f"File already exists: {path}")
                
            target_path.parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(target_path, mode='w', encoding='utf-8') as f:
                if content:
                    await f.write(content)
            return str(target_path)
        except Exception as e:
            logger.error(f"Error creating file {path}: {str(e)}")
            raise
            
    async def list_directory(self, path: str) -> List[Dict[str, Any]]:
        """List files and folders in a directory."""
        try:
            target_path = self._resolve_path(path)
            if not target_path.exists():
                raise FileNotFoundError(f"Directory not found: {path}")
            if not target_path.is_dir():
                raise NotADirectoryError(f"Path is not a directory: {path}")
                
            items = []
            for item in target_path.iterdir():
                items.append({
                    "name": item.name,
                    "path": str(item),
                    "type": "directory" if item.is_dir() else "file",
                    "size": item.stat().st_size if item.is_file() else 0
                })
            
            # Sort directories first, then files
            items.sort(key=lambda x: (0 if x["type"] == "directory" else 1, x["name"].lower()))
            return items
        except Exception as e:
            logger.error(f"Error listing directory {path}: {str(e)}")
            raise
            
    async def delete_file(self, path: str) -> bool:
        """Delete a file. Only operates within home dir and never deletes system dirs."""
        try:
            target_path = self._resolve_path(path)
            
            if not target_path.exists():
                raise FileNotFoundError(f"File not found: {path}")
                
            if target_path.is_dir():
                raise IsADirectoryError(f"Cannot delete directories, only files: {path}")
                
            # Extra safety check for common system or important directories
            dangerous_paths = [
                self.home_dir / ".ssh",
                self.home_dir / ".gnupg",
                self.home_dir / "Library",
                self.home_dir / "Applications",
            ]
            
            for danger in dangerous_paths:
                if danger in target_path.parents or target_path == danger:
                    raise PermissionError(f"Safety constraint: cannot delete files in system directories")
            
            target_path.unlink()
            return True
        except Exception as e:
            logger.error(f"Error deleting file {path}: {str(e)}")
            raise

file_service = FileService()
