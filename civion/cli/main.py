"""
CIVION CLI Main Entry Point
"""
import os
import signal
import subprocess
import sys
import threading
import time
import webbrowser
import requests
from pathlib import Path
from typing import Optional

import typer
import uvicorn
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.live import Live
from rich.prompt import Confirm

from civion.core.config import config
from civion.cli.setup_wizard import run_setup

app = typer.Typer(help="CIVION — AI Intelligence Command Center")
agent_app = typer.Typer(help="Manage CIVION Agents")
config_app = typer.Typer(help="Manage CIVION Configuration")

app.add_typer(agent_app, name="agent")
app.add_typer(config_app, name="config")

console = Console()

CIVION_DIR = Path.home() / ".civion"
PID_FILE = CIVION_DIR / "civion.pid"

@app.command()
def setup():
    """Run the interactive setup wizard"""
    import asyncio
    asyncio.run(run_setup())

@app.command()
def start(
    port: Optional[int] = typer.Option(None, help="Override port"),
    host: Optional[str] = typer.Option(None, help="Override host"),
    reload: bool = typer.Option(False, help="Enable auto-reload (dev)")
):
    """Start CIVION — backend + frontend in one command"""
    if not config.config_exists():
        console.print("[yellow]CIVION is not configured yet. Running setup...[/yellow]")
        setup()
        return

    run_port = port or config.port
    run_host = host or config.host or "0.0.0.0"
    
    # Save PID
    os.makedirs(CIVION_DIR, exist_ok=True)
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))

    console.print(Panel(
        f"[bold green]Starting CIVION...[/bold green]\n\n"
        f"Backend + Frontend: [link=http://localhost:{run_port}]http://localhost:{run_port}[/link]\n"
        f"API Documentation: [link=http://localhost:{run_port}/api/v1/docs]http://localhost:{run_port}/api/v1/docs[/link]",
        title="CIVION v2.0", border_style="cyan"
    ))

    def open_browser():
        if config.auto_open_browser:
            time.sleep(1.5)
            url = f"http://localhost:{run_port}"
            console.print(f"[dim]Opening {url}...[/dim]")
            webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        uvicorn.run(
            "civion.api.server:app",
            host=run_host,
            port=run_port,
            reload=reload,
            log_level=config.log_level.lower()
        )
    except Exception as e:
        console.print(f"[red]Failed to start server: {e}[/red]")
    finally:
        if PID_FILE.exists():
            PID_FILE.unlink()

@app.command()
def stop():
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

@app.command()
def status():
    """Show system status"""
    table = Table(title="CIVION System Status", box=None)
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
    
    console.print(table)

@app.command()
def doctor():
    """Diagnose and fix common issues"""
    console.print("[bold]Running CIVION diagnostics...[/bold]")
    
    with Live(console=console, refresh_per_second=4) as live:
        # Check config
        time.sleep(0.5)
        if config.config_exists():
            live.console.print("  ✓ Config file exists")
        else:
            live.console.print("  ✗ Config file missing (run 'civion setup')")
        
        # Check Python
        time.sleep(0.5)
        if sys.version_info >= (3, 10):
            live.console.print(f"  ✓ Python version {sys.version.split()[0]} (required: 3.10+)")
        else:
            live.console.print(f"  ✗ Python version {sys.version.split()[0]} too old")
            
        # Check Port
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(("127.0.0.1", config.port))
            live.console.print(f"  ✓ Port {config.port} is available")
        except:
            live.console.print(f"  ✗ Port {config.port} in use")
        finally:
            s.close()

        # Check Frontend Bundle
        static_path = Path(__file__).parent.parent / "static" / "ui"
        if (static_path / "index.html").exists():
            live.console.print("  ✓ Frontend bundle is present")
        else:
            live.console.print("  ✗ Frontend bundle missing (run './scripts/build_frontend.sh')")
            
    console.print("\n[green]Diagnostics complete.[/green]")

@app.command()
def logs(follow: bool = typer.Option(False, "--follow", "-f")):
    """Show recent logs"""
    log_file = config.logs_dir / "civion.log"
    if not log_file.exists():
        console.print("[yellow]No logs found yet.[/yellow]")
        return
    
    if follow:
        os.system(f"tail -f {log_file}")
    else:
        os.system(f"tail -n 100 {log_file}")

@app.command()
def guide():
    """Show interactive user guide"""
    table = Table(title="CIVION User Guide", box=None)
    table.add_column("Topic", style="bold cyan")
    table.add_column("Description", style="white")
    
    table.add_row("Getting Started", "Run [bold]civion setup[/bold] to configure your API keys and profile. Then run [bold]civion start[/bold] and open the browser.")
    table.add_row("AI Providers", "You need one API key (e.g. OpenAI or Anthropic). You can also run locally with Ollama (select ollama as provider).")
    table.add_row("Agents", "Agents automatically scan sources for data. You must start them first! Use the Agents page or CLI.")
    table.add_row("NICK", "Your conversational AI assistant. Press the bottom right button in the UI.")
    table.add_row("Troubleshooting", "If something breaks, run [bold]civion doctor[/bold] or check [bold]civion logs[/bold].")
    
    console.print(Panel(table, title="Knowledge Base", border_style="cyan"))

@app.command()
def update():
    """Update CIVION"""
    console.print("Updating CIVION...")
    os.system("pip install --upgrade civion")
    console.print("[green]✓ CIVION updated[/green]")

@app.command()
def reset(keep_data: bool = typer.Option(False, "--keep-data")):
    """Reset configuration to defaults"""
    if Confirm.ask("This will clear your config. Continue?"):
        import shutil
        if keep_data:
            from civion.core.config import _env_file
            if config.config_file.exists(): config.config_file.unlink()
            if _env_file.exists(): _env_file.unlink()
        else:
            shutil.rmtree(CIVION_DIR, ignore_errors=True)
        console.print("[green]✓ CIVION reset complete[/green]")

# --- Agent Subcommands ---

@agent_app.command("list")
def agent_list():
    """List all agents and their status"""
    console.print("[dim]Querying agent statuses from running server...[/dim]")
    try:
        res = requests.get(f"http://localhost:{config.port}/api/v1/agents", timeout=3)
        res.raise_for_status()
        agents = res.json()
        
        table = Table(title="Running Agents", box=None)
        table.add_column("Agent ID", style="bold cyan")
        table.add_column("Status")
        table.add_column("Current Task")
        table.add_column("Signals Found")
        
        for agent in agents:
            status_color = "green" if agent["status"] == "running" else ("red" if agent["status"] == "error" else "yellow")
            table.add_row(
                agent["name"],
                f"[{status_color}]{agent['status']}[/{status_color}]",
                agent["current_task"],
                str(agent["signals_found"])
            )
        console.print(table)
    except requests.exceptions.RequestException:
        console.print(f"[red]CIVION doesn't appear to be running. Start it with: civion start[/red]")

@agent_app.command("start")
def agent_start(name: str = typer.Argument("all")):
    """Start an agent"""
    try:
        url = f"http://localhost:{config.port}/api/v1/agents"
        url += "/run-all" if name == "all" else f"/{name}/start"
        res = requests.post(url, timeout=5)
        res.raise_for_status()
        console.print(f"[green]✓ Successfully started {name}[/green]")
    except Exception as e:
        console.print(f"[red]Failed to start: {e}[/red]")

# --- Config Subcommands ---

@config_app.command("show")
def config_show():
    """Show current configuration"""
    data = config.to_dict()
    table = Table(title="Current Configuration", box=None)
    for k, v in data.items():
        table.add_row(k, str(v))
    console.print(table)

@config_app.command("add-key")
def config_add_key(provider: str, key: str = typer.Argument(..., help="API Key")):
    """Add/Update API key for a provider"""
    from civion.core.config import _save_env_file
    _save_env_file({f"{provider.upper()}_{'API_KEY' if provider.lower() != 'github' else 'TOKEN'}": key})
    console.print(f"[green]Key for {provider} updated successfully.[/green]")

if __name__ == "__main__":
    app()
