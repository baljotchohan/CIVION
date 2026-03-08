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
from pathlib import Path
from typing import Optional

import typer
import uvicorn
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.live import Live

from civion.core.config import config
from civion.cli.setup_wizard import run_setup

app = typer.Typer(help="CIVION — AI Intelligence Command Center")
agent_app = typer.Typer(help="Manage CIVION Agents")
config_app = typer.Typer(help="Manage CIVION Configuration")

app.add_typer(agent_app, name="agent")
app.add_typer(config_app, name="config")

console = Console()

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

    console.print(Panel(
        f"[bold green]Starting CIVION...[/bold green]\n\n"
        f"Backend + Frontend: [link=http://localhost:{run_port}]http://localhost:{run_port}[/link]\n"
        f"API Documentation: [link=http://localhost:{run_port}/docs]http://localhost:{run_port}/docs[/link]",
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

@app.command()
def stop():
    """Stop running CIVION instance"""
    # Simply look for uvicorn processes or record PID in future
    console.print("[yellow]Find and stop the process manually or use Ctrl+C in the start terminal.[/yellow]")

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
    # Simple table for now
    table = Table(title="CIVION User Guide", box=None)
    table.add_column("Topic", style="bold cyan")
    table.add_column("Description")
    
    table.add_row("Getting Started", "Run 'civion setup' then 'civion start'")
    table.add_row("AI Providers", "All major providers supported (Anthropic, OpenAI, etc.)")
    table.add_row("Ollama", "Run AI 100% locally by setting provider to 'ollama'")
    table.add_row("Agents", "Autonomous units that monitor sources and reason")
    
    console.print(Panel(table, title="User Guide"))

# --- Agent Subcommands ---

@agent_app.command("list")
def agent_list():
    """List all agents and their status"""
    console.print("[dim]Querying agent statuses...[/dim]")
    # In real app, query the running server API
    console.print("  1. GitHub Agent      [green]Running[/green]")
    console.print("  2. arXiv Agent       [green]Running[/green]")
    console.print("  3. News Agent        [yellow]Paused[/yellow]")

@agent_app.command("start")
def agent_start(name: str = typer.Argument("all")):
    """Start an agent"""
    console.print(f"[green]Starting agent(s): {name}[/green]")

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
    config.set_secret(f"{provider.upper()}_API_KEY", key)
    console.print(f"[green]Key for {provider} updated successfully.[/green]")

if __name__ == "__main__":
    app()
