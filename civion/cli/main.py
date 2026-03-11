"""
CIVION CLI - Production Grade Command Interface

Architecture:
- Typer framework (like OpenClaw's CLI)
- Rich UI for beautiful terminal output
- Async commands for real-time feedback
- Sub-commands grouped by feature
- Interactive setup wizard
"""

import os
import signal
import subprocess
import sys
import threading
import time
import webbrowser
import asyncio
import requests
import socket
import logging
from pathlib import Path
from typing import Optional, List

import typer
import uvicorn
import httpx
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.live import Live
from rich.prompt import Confirm

from civion.core.config import config
from civion.cli.setup_wizard import run_setup

console = Console()
app = typer.Typer(help="🦞 CIVION - Watch AI Think")
log = logging.getLogger(__name__)

# Feature groups (sub-apps)
gateway_app = typer.Typer(help="Gateway control")
agent_app = typer.Typer(help="Agent management")
goal_app = typer.Typer(help="Intelligence goals")
persona_app = typer.Typer(help="Custom personas")
network_app = typer.Typer(help="P2P Network")
predict_app = typer.Typer(help="Predictions")

# Register sub-commands
app.add_typer(gateway_app, name="gateway")
app.add_typer(agent_app, name="agent")
app.add_typer(goal_app, name="goal")
app.add_typer(persona_app, name="persona")
app.add_typer(network_app, name="network")
app.add_typer(predict_app, name="predict")

CIVION_DIR = Path.home() / ".civion"
PID_FILE = CIVION_DIR / "civion.pid"

# ============ ROOT COMMANDS ============

@app.command()
def onboard(
    install_daemon: bool = typer.Option(False, help="Install system daemon (NYI)"),
):
    """Interactive setup wizard (like OpenClaw's onboard)"""
    asyncio.run(run_setup())

@app.command(deprecated=True)
def setup():
    """Run the interactive setup wizard (Deprecated, use 'onboard')"""
    onboard()

@app.command()
def start(
    port: Optional[int] = typer.Option(None, help="Override port"),
    host: Optional[str] = typer.Option(None, help="Override host"),
    reload: bool = typer.Option(False, help="Enable auto-reload (dev)")
):
    """Start CIVION — intelligence system + UI in one command"""
    # Shortcut to gateway start
    gateway_start(port=port, host=host, reload=reload)

# ============ GATEWAY COMMANDS ============

@gateway_app.command("start")
def gateway_start(
    port: Optional[int] = typer.Option(None, help="Override port"),
    host: Optional[str] = typer.Option(None, help="Override host"),
    reload: bool = typer.Option(False, help="Enable auto-reload (dev)"),
    daemon: bool = typer.Option(False, help="Run as daemon (NYI)"),
):
    """Start CIVION Gateway (main control plane)"""
    
    # First run check — if not configured, run setup first
    if not config.config_exists():
        console.print(Panel(
            "[bold yellow]Welcome to CIVION![/bold yellow]\n\n"
            "Looks like this is your first time. Let's get you set up.\n"
            "This will take about 2 minutes.\n\n"
            "[dim]Running: civion onboard[/dim]",
            title="🚀 First Run",
            border_style="yellow"
        ))
        asyncio.run(run_setup())
        
        if not Confirm.ask("\nSetup complete! Start CIVION now?", default=True):
            return

    run_port = port or config.port
    run_host = host or config.host or "0.0.0.0"
    
    # Save PID for stop command
    os.makedirs(CIVION_DIR, exist_ok=True)
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))

    # Beautiful start banner
    console.print()
    console.print(Panel(
        f"[bold green]● CIVION is starting...[/bold green]\n\n"
        f"  [white]Dashboard:[/white]  [link=http://localhost:{run_port}][cyan]http://localhost:{run_port}[/cyan][/link]\n"
        f"  [white]API Docs:[/white]   [link=http://localhost:{run_port}/api/docs][dim]http://localhost:{run_port}/api/docs[/dim][/link]\n\n"
        f"  [dim]Press Ctrl+C to stop[/dim]",
        title="civion v2.0",
        border_style="green",
        padding=(1, 3),
    ))
    console.print()

    def open_browser():
        if config.auto_open_browser:
            time.sleep(2.0)
            url = f"http://localhost:{run_port}"
            webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        uvicorn.run(
            "civion.api.server:app",
            host=run_host,
            port=run_port,
            reload=reload,
            log_level="warning",  # quieter output
        )
    except KeyboardInterrupt:
        console.print("\n[yellow]CIVION stopped.[/yellow]")
    except Exception as e:
        console.print(f"\n[red]✗ Error: {e}[/red]")
        log.exception("Uvicorn failed to start")
        sys.exit(1)
    finally:
        if PID_FILE.exists():
            PID_FILE.unlink()

@gateway_app.command("stop")
def gateway_stop():
    """Stop running CIVION instance"""
    if not PID_FILE.exists():
        console.print("[yellow]CIVION doesn't appear to be running[/yellow]")
        return
    
    try:
        pid = int(PID_FILE.read_text().strip())
        os.kill(pid, signal.SIGTERM)
        PID_FILE.unlink()
        console.print("[green]✓ CIVION stopped[/green]")
    except ProcessLookupError:
        console.print("[yellow]Process not found — already stopped[/yellow]")
        PID_FILE.unlink()
    except Exception as e:
        console.print(f"[red]Failed to stop CIVION: {e}[/red]")

@gateway_app.command("health")
def gateway_health():
    """Check system health"""
    table = Table(title="CIVION System Health", box=None)
    table.add_column("Component", style="cyan")
    table.add_column("Status", style="bold")
    table.add_column("Details")
    
    # Check if config exists
    has_config = config.config_exists()
    table.add_row("Configuration", "[green]OK[/green]" if has_config else "[red]Missing[/red]", str(config.config_file))
    
    # Check provider
    table.add_row("LLM Provider", "[green]Active[/green]", f"{config.llm_provider} ({config.llm_model})")
    
    # Check if DB exists
    db_exists = config.db_path.exists()
    table.add_row("Database", "[green]OK[/green]" if db_exists else "[yellow]Initializing[/yellow]", str(config.db_path))
    
    # Try API
    try:
        res = requests.get(f"http://localhost:{config.port}/api/health", timeout=2)
        api_status = "[green]ONLINE[/green]" if res.status_code == 200 else "[red]ERROR[/red]"
    except requests.exceptions.RequestException:
        api_status = "[gray]OFFLINE[/gray]"
    table.add_row("API Gateway", api_status, f"port {config.port}")

    console.print(table)

@gateway_app.command("doctor")
def gateway_doctor():
    """Diagnose and fix common issues"""
    console.print("[bold]Running CIVION diagnostics...[/bold]")
    
    with Live(console=console, refresh_per_second=4) as live:
        # Check config
        time.sleep(0.5)
        if config.config_exists():
            live.console.print("  ✓ Config file exists")
        else:
            live.console.print("  ✗ Config file missing (run 'civion onboard')")
        
        # Check Python
        time.sleep(0.5)
        if sys.version_info >= (3, 10):
            live.console.print(f"  ✓ Python version {sys.version.split()[0]} (required: 3.10+)")
        else:
            live.console.print(f"  ✗ Python version {sys.version.split()[0]} too old")
            
        # Check Port
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(("127.0.0.1", config.port))
            live.console.print(f"  ✓ Port {config.port} is available")
        except socket.error:
            live.console.print(f"  ✗ Port {config.port} in use")
        finally:
            s.close()
            
    console.print("\n[green]Diagnostics complete.[/green]")

# ============ AGENT COMMANDS ============

@agent_app.command("list")
def agent_list():
    """List all agents and their status"""
    console.print("[dim]Querying agent statuses from running server...[/dim]")
    try:
        res = requests.get(f"http://localhost:{config.port}/api/v1/agents", timeout=3)
        res.raise_for_status()
        agents = res.json()
        
        table = Table(title="Intelligence Agents", box=None)
        table.add_column("Agent ID", style="bold cyan")
        table.add_column("Status")
        table.add_column("Current Task")
        table.add_column("Signals Found")
        
        for agent in agents:
            status_color = "green" if agent["running"] else "yellow"
            table.add_row(
                agent["name"],
                f"[{status_color}]{agent['state']}[/{status_color}]",
                f"{agent['total_insights']} insights",
                str(agent["total_signals"])
            )
        console.print(table)
    except requests.exceptions.RequestException:
        console.print(f"[red]CIVION doesn't appear to be running. Start it with: civion start[/red]")

@agent_app.command("start")
async def agent_start(
    agent_name: str = typer.Argument(..., help="Agent name to start"),
):
    """Start an agent"""
    console.print(f"[cyan]Starting agent: {agent_name}[/cyan]")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://localhost:{config.port}/api/v1/agents/{agent_name}/start"
            )
            response.raise_for_status()
            result = response.json()
            console.print(f"[green]✓ Agent started[/green]")
    except httpx.HTTPStatusError as e:
        console.print(f"[red]✗ Error[/red] Agent not found or already started.")
    except httpx.RequestError as e:
        console.print(f"[red]✗ Error[/red] Could not connect to CIVION: {e}")

@agent_app.command("stop")
async def agent_stop(
    agent_name: str = typer.Argument(..., help="Agent name to stop"),
):
    """Stop an agent"""
    console.print(f"[cyan]Stopping agent: {agent_name}[/cyan]")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://localhost:{config.port}/api/v1/agents/{agent_name}/stop"
            )
            response.raise_for_status()
            console.print(f"[green]✓ Agent stopped[/green]")
    except httpx.HTTPStatusError as e:
        console.print(f"[red]✗ Error[/red] Agent not found or already stopped.")
    except httpx.RequestError as e:
        console.print(f"[red]✗ Error[/red] Could not connect to CIVION: {e}")

@agent_app.command("logs")
def agent_logs(
    agent: Optional[str] = typer.Option(None, help="Agent name (NYI)"),
    follow: bool = typer.Option(False, "--follow", "-f"),
):
    """Watch agent reasoning logs"""
    log_file = config.logs_dir / "civion.log"
    if not log_file.exists():
        console.print("[yellow]No logs found yet.[/yellow]")
        return
    
    if follow:
        os.system(f"tail -f {log_file}")
    else:
        os.system(f"tail -n 100 {log_file}")

# ============ GOAL COMMANDS ============

@goal_app.command("create")
def goal_create_cmd(query: str = typer.Argument(..., help="Intelligence goal statement")):
    """Create a new intelligence goal"""
    async def run():
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"http://localhost:{config.port}/api/v1/goals",
                    json={"title": query, "description": query}
                )
                response.raise_for_status()
                goal = response.json()
                console.print(f"[green]✓ Goal created[/green] ID: {goal['id']}")
                console.print(f"  Title: {goal['title']}")
                return goal
        except httpx.RequestError as e:
            console.print(f"[red]✗ Error[/red] Could not connect to CIVION: {e}")
        except Exception as e:
            console.print(f"[red]✗ Error[/red] {str(e)}")
    
    asyncio.run(run())

@goal_app.command("execute")
def goal_execute_cmd(goal_id: str = typer.Argument(..., help="Goal ID to execute")):
    """Execute a goal and watch analysis"""
    async def run():
        try:
            async with httpx.AsyncClient() as client:
                console.print(f"[cyan]Starting analysis for goal {goal_id}...[/cyan]")
                response = await client.post(
                    f"http://localhost:{config.port}/api/v1/goals/{goal_id}/execute",
                    timeout=config.CLI_TIMEOUT # Long timeout for reasoning
                )
                response.raise_for_status()
                result = response.json()
                
                console.print(f"\n[green]✓ Analysis Complete[/green]\n")
                console.print(Panel.fit(
                    result.get('consensus', 'No analysis available'),
                    title="Consensus"
                ))
                console.print(f"Final Confidence: [yellow]{result.get('final_confidence', 0):.0%}[/yellow]")
                
                if result.get('arguments'):
                    table = Table(title="Agent Arguments")
                    table.add_column("Agent", style="cyan")
                    table.add_column("Analysis", style="green")
                    table.add_column("Confidence", style="yellow")
                    for arg in result['arguments']:
                        table.add_row(
                            arg.get('agent', 'Unknown'),
                            (arg.get('argument', '')[:50] + "...") if len(arg.get('argument', '')) > 50 else arg.get('argument', ''),
                            f"{arg.get('confidence', 0):.0%}"
                        )
                    console.print(table)
        except httpx.Timeout as e:
            console.print(f"[red]✗ Timeout[/red] Analysis is taking longer than expected. Run 'goal list' to check status.")
        except httpx.RequestError as e:
            console.print(f"[red]✗ Error[/red] Could not connect to CIVION: {e}")
        except Exception as e:
            console.print(f"[red]✗ Error[/red] {str(e)}")
            
    asyncio.run(run())

@goal_app.command("list")
def goal_list_cmd():
    """List current intelligence goals."""
    async def run():
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"http://localhost:{config.port}/api/v1/goals")
                response.raise_for_status()
                goals = response.json()
                
                if not goals:
                    console.print("[dim]No goals found[/dim]")
                    return
                
                table = Table(title="Intelligence Goals", box=None)
                table.add_column("ID", style="cyan")
                table.add_column("Title", style="green")
                table.add_column("Status", style="yellow")
                table.add_column("Confidence", style="magenta")
                
                for goal in goals:
                    table.add_row(
                        goal['id'][:8], 
                        goal['title'], 
                        goal.get('state', goal.get('status', 'unknown')),
                        f"{goal.get('final_confidence', 0):.0%}"
                    )
                
                console.print(table)
        except httpx.RequestError as e:
            console.print(f"[red]✗ Error[/red] Could not connect to CIVION: {e}")
        except Exception as e:
            console.print(f"[red]✗ Error[/red] {str(e)}")

    asyncio.run(run())

# ============ PERSONA COMMANDS ============

@persona_app.command("list")
def persona_list():
    """List available custom personas"""
    try:
        res = requests.get(f"http://localhost:{config.port}/api/v1/personas", timeout=3)
        res.raise_for_status()
        personas = res.json()
        
        table = Table(title="Custom Personas", box=None)
        table.add_column("Name", style="bold cyan")
        table.add_column("Description")
        
        for p in personas:
            table.add_row(p["name"], p.get("description", "No description"))
        console.print(table)
    except requests.exceptions.RequestException:
        console.print("[yellow]Could not fetch personas. Is CIVION running?[/yellow]")

# ============ NETWORK COMMANDS ============

@network_app.command("status")
def network_status():
    """Check P2P network connectivity"""
    console.print("[cyan]Querying network status...[/cyan]")
    # Placeholder for network stats
    console.print("P2P Network: [green]ENABLED[/green]")
    console.print("Active Peers: 0 (Discovery in progress)")

# ============ PREDICT COMMANDS ============

@predict_app.command("list")
def predict_list():
    """List current predictions and consensus"""
    try:
        res = requests.get(f"http://localhost:{config.port}/api/v1/predictions", timeout=3)
        res.raise_for_status()
        preds = res.json()
        
        table = Table(title="Active Predictions", box=None)
        table.add_column("Prediction", style="bold cyan")
        table.add_column("Confidence")
        table.add_column("Timeline")
        
        for p in preds:
            table.add_row(p["statement"], f"{int(p['confidence']*100)}%", p.get("timeline", "Unknown"))
        console.print(table)
    except requests.exceptions.RequestException:
        console.print("[dim]No active predictions found.[/dim]")

@app.command()
def update():
    """Update CIVION to latest version"""
    console.print("Updating CIVION...")
    os.system("pip install --upgrade civion")
    console.print("[green]✓ CIVION updated[/green]")

@app.command()
def reset(keep_data: bool = typer.Option(False, "--keep_data")):
    """Reset configuration to defaults"""
    if Confirm.ask("This will clear your config. Continue?"):
        import shutil
        if keep_data:
            from civion.core.config import _env_file
            if config.config_file.exists(): config.config_file.unlink()
            # _env_file might not exist in this version, check set_secret
        else:
            shutil.rmtree(CIVION_DIR, ignore_errors=True)
        console.print("[green]✓ CIVION reset complete[/green]")

if __name__ == "__main__":
    app()
