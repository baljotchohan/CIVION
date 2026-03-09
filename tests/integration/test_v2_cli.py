import pytest
from typer.testing import CliRunner
from civion.cli.main import app

runner = CliRunner()

def test_cli_help():
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "onboard" in result.output
    assert "gateway" in result.output
    assert "agent" in result.output

def test_gateway_help():
    result = runner.invoke(app, ["gateway", "--help"])
    assert result.exit_code == 0
    assert "start" in result.output
    assert "doctor" in result.output

def test_agent_list():
    result = runner.invoke(app, ["agent", "list"])
    assert "running" in result.output.lower() or "agents" in result.output.lower() or "error" in result.output.lower()

def test_goal_list():
    result = runner.invoke(app, ["goal", "list"])
    assert "goals" in result.output.lower() or "running" in result.output.lower() or "error" in result.output.lower()

def test_persona_list():
    result = runner.invoke(app, ["persona", "list"])
    assert "personas" in result.output.lower() or "running" in result.output.lower() or "error" in result.output.lower()

def test_predict_list():
    result = runner.invoke(app, ["predict", "list"])
    assert "predictions" in result.output.lower() or "running" in result.output.lower() or "found" in result.output.lower()
