from __future__ import annotations
from typing import Any, List
from civion.tools.base_tool import BaseTool, tool_registry
from civion.engine.sandbox import AgentSandbox

class FileSystemTool(BaseTool):
    """
    Tool for sandboxed file system operations.
    """
    name = "filesystem"
    description = "Read files, list directories, and write reports within the safe workspace sandbox."

    async def execute(self, action: str, **kwargs) -> Any:
        """
        Execute file system actions.
        
        Actions:
          read_file: path (str)
          list_files: directory (str)
          write_report: filename (str), content (str)
        """
        if not self.context or not hasattr(self.context, "sandbox"):
            # Fallback for manual use or if context is missing sandbox
            sandbox = AgentSandbox(agent_name=getattr(self.context, "name", "system"))
        else:
            sandbox = self.context.sandbox

        if action == "read_file":
            return sandbox.read_file(kwargs.get("path", ""))
        elif action == "list_files":
            return sandbox.list_files(kwargs.get("directory", "."))
        elif action == "write_report":
            return str(sandbox.write_report(kwargs.get("filename", ""), kwargs.get("content", "")))
        else:
            raise ValueError(f"Unknown action: {action}")

# Register the tool
tool_registry.register(FileSystemTool)
