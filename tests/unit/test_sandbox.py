import pytest
from pathlib import Path
from civion.engine.sandbox import AgentSandbox, SandboxError, _WORKSPACE

@pytest.fixture
def sandbox():
    return AgentSandbox("test_agent")

def test_sandbox_validate_path_safe(sandbox):
    path = _WORKSPACE / "civion" / "engine" / "sandbox.py"
    safe_path = sandbox._validate_path(path)
    assert safe_path == path.resolve()

def test_sandbox_validate_path_traversal(sandbox):
    with pytest.raises(SandboxError, match="Path traversal blocked"):
        sandbox._validate_path("../../../etc/passwd")

def test_sandbox_validate_path_outside_workspace(sandbox):
    with pytest.raises(SandboxError, match="Access denied"):
        sandbox._validate_path("/tmp/dangerous_file")

def test_sandbox_read_file(sandbox):
    # Read this test file itself or something known to exist
    path = _WORKSPACE / "README.md"
    content = sandbox.read_file(path)
    assert "CIVION" in content

def test_sandbox_write_report(sandbox):
    report_name = "test_report.txt"
    content = "Hello from sandbox!"
    path = sandbox.write_report(report_name, content)
    assert path.exists()
    assert path.name == report_name
    assert path.read_text() == content
    # Cleanup
    path.unlink()

def test_sandbox_run_safe_command(sandbox):
    output = sandbox.run_command(["echo", "hello"])
    assert "hello" in output

def test_sandbox_run_unsafe_command(sandbox):
    with pytest.raises(SandboxError, match="not allowed"):
        sandbox.run_command(["rm", "-rf", "/"])

def test_sandbox_list_files(sandbox):
    files = sandbox.list_files("civion/engine")
    assert "sandbox.py" in files
