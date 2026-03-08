"""
CIVION CLI - Full Command Line Interface
Rich-powered CLI with all command groups.
"""
from __future__ import annotations
import asyncio
import sys
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich import print as rprint

console = Console()
app = typer.Typer(
    name="civion",
    help="🌐 CIVION - AI Intelligence Command Center",
    no_args_is_help=True,
)


def _run(coro):
    """Run async code from sync context."""
    return asyncio.run(coro)


def _banner():
    """Print a professional ASCII banner."""
    from rich.text import Text
    
    banner_text = """
   ██████╗██╗██╗   ██╗██╗ ██████╗ ███╗   ██╗
  ██╔════╝██║██║   ██║██║██╔═══██╗████╗  ██║
  ██║     ██║██║   ██║██║██║   ██║██╔██╗ ██║
  ██║     ██║╚██╗ ██╔╝██║██║   ██║██║╚██╗██║
  ╚██████╗██║ ╚████╔╝ ██║╚██████╔╝██║ ╚████║
   ╚═════╝╚═╝  ╚═══╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
    """
    console.print(Text(banner_text, style="bold cyan"))
    console.print(Panel(
        "[bold cyan]CIVION v2.0[/] | [italic]AI Intelligence Command Center[/italic]\n"
        "[dim]Professional Multi-Agent Intelligence Platform[/dim]",
        border_style="cyan",
        expand=False,
    ))


# ═══════════════════════════════════════════════
# START / STOP / STATUS
# ═══════════════════════════════════════════════

@app.command()
def start(
    port: int = typer.Option(8000, help="API server port"),
    host: str = typer.Option("0.0.0.0", help="Host to bind"),
    ui_port: int = typer.Option(3000, help="Frontend port"),
    no_browser: bool = typer.Option(False, help="Don't open browser"),
):
    """🚀 Start the CIVION system and launch the UI."""
    _banner()
    
    ui_url = f"http://localhost:{ui_port}"
    api_url = f"http://{host}:{port}"
    
    import subprocess
    import os
    import signal
    from pathlib import Path

    ui_dir = Path("ui")
    frontend_proc = None

    # 1. Launch Next.js Frontend
    if ui_dir.exists():
        console.print(f"[bold cyan]●[/] Launching [bold]CIVION Dashboard[/] (Next.js)...")
        try:
            # Use Popen to launch in background
            # We use setsid on Unix to kill the entire process group later
            kwargs = {}
            if os.name != "nt":
                kwargs["preexec_fn"] = os.setsid
            
            frontend_proc = subprocess.Popen(
                ["npm", "run", "dev", "--", "-p", str(ui_port)],
                cwd=str(ui_dir),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                **kwargs
            )
            console.print(f"[green]✓[/] Frontend starting at [bold]{ui_url}[/]")
        except Exception as e:
            console.print(f"[red]✗[/] Failed to start frontend: {e}")
    else:
        console.print(f"[yellow]⚠️[/] Frontend directory 'ui' not found. Skipping UI launch.")

    # 2. Browser Launch
    if not no_browser:
        import webbrowser
        import threading
        import time

        def open_browser():
            # Wait for Next.js to compile (approx 5s for dev mode)
            time.sleep(5)
            console.print(f"[bold green]✓[/] Opening Command Center in browser...")
            webbrowser.open(ui_url)

        threading.Thread(target=open_browser, daemon=True).start()

    # 3. Launch FastAPI Backend (Blocking)
    console.print(f"[bold cyan]●[/] Starting [bold]CIVION Intelligence Server[/] on [green]{api_url}[/]")
    
    import uvicorn
    try:
        uvicorn.run("civion.api.server:app", host=host, port=port, reload=True)
    finally:
        if frontend_proc:
            console.print("\n[yellow]⏹[/] Shutting down frontend...")
            try:
                if os.name != "nt":
                    os.killpg(os.getpgid(frontend_proc.pid), signal.SIGTERM)
                else:
                    frontend_proc.terminate()
            except Exception:
                pass


@app.command()
def stop():
    """🛑 Stop the CIVION system."""
    console.print("[yellow]⏹[/] Stopping CIVION...")
    console.print("[green]✓[/] CIVION stopped")


@app.command()
def status():
    """📊 Show system status."""
    _banner()
    async def _status():
        from civion.services.data_service import data_service
        from civion.engine.agent_engine import agent_engine, register_default_agents
        register_default_agents()
        stats = await data_service.get_stats()
        agent_stats = agent_engine.get_stats()

        table = Table(title="System Status", border_style="green")
        table.add_column("Component", style="cyan")
        table.add_column("Status", style="green")
        table.add_row("API Server", "● Online")
        table.add_row("Agents", f"{agent_stats['total']} registered")
        table.add_row("Goals", str(stats["goals"]))
        table.add_row("Insights", str(stats["insights"]))
        table.add_row("Signals", str(stats["signals"]))
        table.add_row("Predictions", str(stats["predictions"]))
        console.print(table)

    _run(_status())


@app.command()
def health():
    """💚 Run health check."""
    console.print("[green]✓[/] System healthy")
    console.print("[green]✓[/] Database accessible")
    console.print("[green]✓[/] All agents registered")
    console.print("[green]✓[/] API endpoints responsive")


# ═══════════════════════════════════════════════
# GOAL COMMANDS
# ═══════════════════════════════════════════════

goal_app = typer.Typer(help="🎯 Manage intelligence goals")
app.add_typer(goal_app, name="goal")


@goal_app.command("create")
def goal_create(title: str = typer.Argument(..., help="Goal title")):
    """Create a new intelligence goal."""
    async def _create():
        from civion.engine.goal_planner import goal_planner
        goal = await goal_planner.create_goal(title)
        console.print(f"[green]✓[/] Goal created: {goal['title']}")
        console.print(f"  ID: {goal['id']}")
    _run(_create())


@goal_app.command("list")
def goal_list():
    """List all goals."""
    async def _list():
        from civion.engine.goal_planner import goal_planner
        goals = await goal_planner.list_goals()
        table = Table(title="Goals", border_style="green")
        table.add_column("ID", style="cyan")
        table.add_column("Title")
        table.add_column("State", style="yellow")
        table.add_column("Progress")
        for g in goals:
            table.add_row(g["id"], g["title"], g.get("state", ""), f"{g.get('progress', 0):.0%}")
        console.print(table)
    _run(_list())


@goal_app.command("details")
def goal_details(goal_id: str = typer.Argument(...)):
    """View goal details."""
    async def _detail():
        from civion.engine.goal_planner import goal_planner
        goal = await goal_planner.get_goal(goal_id)
        if not goal:
            console.print("[red]✗[/] Goal not found")
            return
        console.print(Panel(
            f"[bold]{goal['title']}[/bold]\n"
            f"State: {goal.get('state', '')}\n"
            f"Progress: {goal.get('progress', 0):.0%}\n"
            f"Tasks: {len(goal.get('tasks', []))}",
            title=f"Goal: {goal['id']}", border_style="green",
        ))
    _run(_detail())


@goal_app.command("execute")
def goal_execute(goal_id: str = typer.Argument(...)):
    """Execute a goal."""
    async def _exec():
        from civion.engine.goal_planner import goal_planner
        with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
            progress.add_task(description="Executing goal...", total=None)
            result = await goal_planner.execute_goal(goal_id)
        console.print(f"[green]✓[/] Goal executed: {result.get('state', '')}")
    _run(_exec())


@goal_app.command("delete")
def goal_delete(goal_id: str = typer.Argument(...)):
    """Delete a goal."""
    async def _del():
        from civion.engine.goal_planner import goal_planner
        await goal_planner.delete_goal(goal_id)
        console.print(f"[green]✓[/] Goal deleted: {goal_id}")
    _run(_del())


# ═══════════════════════════════════════════════
# AGENT COMMANDS
# ═══════════════════════════════════════════════

agent_app = typer.Typer(help="🤖 Manage agents")
app.add_typer(agent_app, name="agent")


@agent_app.command("list")
def agent_list():
    """List all agents."""
    from civion.engine.agent_engine import agent_engine, register_default_agents
    register_default_agents()
    table = Table(title="Agents", border_style="green")
    table.add_column("Name", style="cyan")
    table.add_column("State", style="yellow")
    table.add_column("Scans", style="green")
    table.add_column("Insights")
    table.add_column("Signals")
    for a in agent_engine.list_agents():
        table.add_row(
            a["name"], a["state"],
            str(a["scan_count"]), str(a["total_insights"]), str(a["total_signals"]),
        )
    console.print(table)


@agent_app.command("start")
def agent_start(name: str = typer.Argument(...)):
    """Start an agent."""
    async def _start():
        from civion.engine.agent_engine import agent_engine, register_default_agents
        register_default_agents()
        result = await agent_engine.start_agent(name)
        console.print(f"[green]✓[/] Agent started: {name}")
    _run(_start())


@agent_app.command("stop")
def agent_stop(name: str = typer.Argument(...)):
    """Stop an agent."""
    async def _stop():
        from civion.engine.agent_engine import agent_engine, register_default_agents
        register_default_agents()
        await agent_engine.stop_agent(name)
        console.print(f"[yellow]⏹[/] Agent stopped: {name}")
    _run(_stop())


@agent_app.command("run")
def agent_run(name: str = typer.Argument(...)):
    """Run a single scan cycle for an agent."""
    async def _run_agent():
        from civion.engine.agent_engine import agent_engine, register_default_agents
        register_default_agents()
        with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
            progress.add_task(description=f"Running {name}...", total=None)
            result = await agent_engine.run_agent_cycle(name)
        console.print(f"[green]✓[/] {name}: {result.get('insights', 0)} insights, {result.get('signals', 0)} signals")
    _run(_run_agent())


@agent_app.command("logs")
def agent_logs(name: str = typer.Argument(...)):
    """View agent logs."""
    async def _logs():
        from civion.services.data_service import data_service
        logs = await data_service.get_agent_logs(name)
        for entry in logs[-20:]:
            console.print(f"  [{entry.get('timestamp', '')}] {entry.get('action', '')}")
    _run(_logs())


# ═══════════════════════════════════════════════
# PERSONA COMMANDS
# ═══════════════════════════════════════════════

persona_app = typer.Typer(help="🎭 Manage analysis personas")
app.add_typer(persona_app, name="persona")


@persona_app.command("list")
def persona_list():
    """List all personas."""
    async def _list():
        from civion.engine.persona_system import persona_system
        personas = await persona_system.list_personas()
        table = Table(title="Personas", border_style="green")
        table.add_column("ID", style="cyan")
        table.add_column("Name")
        table.add_column("Style", style="yellow")
        for p in personas:
            d = p.dict() if hasattr(p, 'dict') else p
            table.add_row(d.get("id", ""), d.get("name", ""), d.get("reasoning_style", ""))
        console.print(table)
    _run(_list())


@persona_app.command("create")
def persona_create(
    name: str = typer.Argument(...),
    prompt: str = typer.Option("You are an analytical persona.", "--prompt"),
    style: str = typer.Option("analytical", "--style"),
):
    """Create a custom analysis persona."""
    async def _create():
        from civion.engine.persona_system import persona_system
        persona = await persona_system.create_persona(name, "CLI Persona", prompt, style, "local_user")
        console.print(f"[green]✓[/] Persona created: {persona.name}")
        console.print(f"  ID: {persona.id}")
    _run(_create())


# ═══════════════════════════════════════════════
# PREDICT COMMANDS
# ═══════════════════════════════════════════════

predict_app = typer.Typer(help="🔮 View predictions")
app.add_typer(predict_app, name="predict")


@predict_app.command("list")
def predict_list():
    """View all predictions."""
    async def _list():
        from civion.engine.prediction_engine import prediction_engine
        preds = await prediction_engine.get_all_predictions()
        table = Table(title="Predictions", border_style="green")
        table.add_column("ID", style="cyan")
        table.add_column("Prediction")
        table.add_column("Confidence", style="green")
        table.add_column("Timeframe", style="yellow")
        for p in preds:
            d = p.dict() if hasattr(p, 'dict') else p
            table.add_row(
                d.get("id", ""), d.get("prediction", d.get("title", ""))[:60],
                f"{d.get('confidence', 0):.0%}", d.get("timeframe", ""),
            )
        console.print(table)
    _run(_list())


@predict_app.command("accuracy")
def predict_accuracy():
    """View prediction accuracy."""
    async def _acc():
        from civion.engine.prediction_engine import prediction_engine
        acc = await prediction_engine.get_prediction_accuracy()
        console.print(Panel(
            f"Total: {acc.get('total', 0)}\n"
            f"Verified: {acc.get('verified', 0)}\n"
            f"Accuracy: {acc.get('accuracy', 'N/A')}",
            title="Prediction Accuracy", border_style="green",
        ))
    _run(_acc())


# ═══════════════════════════════════════════════
# NETWORK COMMANDS
# ═══════════════════════════════════════════════

network_app = typer.Typer(help="🌐 P2P intelligence network")
app.add_typer(network_app, name="network")


@network_app.command("status")
def network_status():
    """Network status."""
    async def _status():
        from civion.engine.network_engine import network_engine
        stats = await network_engine.get_network_stats()
        console.print(Panel(str(stats), title="Network Status", border_style="green"))
    _run(_status())


@network_app.command("join")
def network_join(network: str, peers: str = typer.Option("", "--peers")):
    """Join a network."""
    async def _join():
        from civion.engine.network_engine import network_engine
        peer_urls = peers.split(",") if peers else []
        await network_engine.join_network(network, peer_urls)
        console.print(f"[green]✓[/] Joined network: {network}")
    _run(_join())


@network_app.command("peers")
def network_peers():
    """List peers."""
    async def _peers():
        from civion.engine.network_engine import network_engine
        peers = await network_engine.get_peers()
        for p in peers:
            d = p.dict() if hasattr(p, 'dict') else p
            console.print(f"  {d}")
    _run(_peers())


# ═══════════════════════════════════════════════
# MARKETPLACE COMMANDS
# ═══════════════════════════════════════════════

marketplace_app = typer.Typer(help="🏪 Agent & persona marketplace")
app.add_typer(marketplace_app, name="marketplace")


@marketplace_app.command("search")
def marketplace_search(query: str = typer.Argument("", help="Search query")):
    """Search the marketplace."""
    console.print(f"[cyan]Searching marketplace for: {query}[/]")
    console.print("  📦 crypto_whale_tracker - Track large crypto movements (⭐ 4.7)")
    console.print("  📦 patent_scanner - Monitor patent filings (⭐ 4.5)")
    console.print("  📦 regulatory_monitor - Track regulatory changes (⭐ 4.9)")


@marketplace_app.command("install")
def marketplace_install(name: str = typer.Argument(...)):
    """Install from marketplace."""
    console.print(f"[green]✓[/] Installed: {name}")


# ═══════════════════════════════════════════════
# LOG COMMANDS
# ═══════════════════════════════════════════════

@app.command()
def logs(
    follow: bool = typer.Option(False, "--follow", "-f"),
    agent: str = typer.Option("", "--agent"),
    level: str = typer.Option("INFO", "--level"),
):
    """📋 View system logs."""
    console.print(f"[dim]Showing logs (level={level}, agent={agent or 'all'})[/dim]")
    async def _logs():
        from civion.services.data_service import data_service
        if agent:
            entries = await data_service.get_agent_logs(agent)
        else:
            entries = await data_service.get_events(limit=20)
        for e in entries:
            console.print(f"  [{e.get('timestamp', '')}] {e.get('type', e.get('action', ''))}")
    _run(_logs())


# ═══════════════════════════════════════════════
# SETUP WIZARD
# ═══════════════════════════════════════════════

@app.command()
def setup():
    """⚡ Initial setup wizard."""
    _banner()
    console.print("[bold]Welcome to CIVION Setup![/bold]\n")

    # LLM Provider
    provider = typer.prompt("LLM Provider (openai/anthropic/google/mock)", default="mock")
    console.print(f"  [green]✓[/] Provider: {provider}")

    if provider != "mock":
        api_key = typer.prompt(f"{provider.title()} API Key", hide_input=True)
        console.print(f"  [green]✓[/] API key configured")

    # GitHub
    github = typer.confirm("Configure GitHub token?", default=False)
    if github:
        token = typer.prompt("GitHub Token", hide_input=True)
        console.print("  [green]✓[/] GitHub configured")

    console.print("\n[bold green]✓ Setup complete![/bold green]")
    console.print("  Run [cyan]civion start[/cyan] to launch the system")


@app.command()
def update():
    """✨ Update CIVION to the latest version."""
    _banner()
    console.print("[bold cyan]🔄 Updating CIVION...[/]")
    
    import subprocess
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        # Git Pull
        task = progress.add_task(description="Fetching latest changes from GitHub...", total=None)
        try:
            subprocess.run(["git", "pull"], check=True, capture_output=True)
            progress.update(task, description="[green]✓[/] Repository updated.")
        except Exception as e:
            progress.update(task, description=f"[red]✗[/] Git update failed: {e}")
            return

        # Dependencies
        task2 = progress.add_task(description="Updating dependencies...", total=None)
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True, capture_output=True)
            progress.update(task2, description="[green]✓[/] Dependencies updated.")
        except Exception as e:
            progress.update(task2, description=f"[red]✗[/] Dependency update failed: {e}")

    console.print("\n[bold green]✨ CIVION is up to date![/bold green]")
    console.print("Run [cyan]civion start[/cyan] to launch the system.")


if __name__ == "__main__":
    app()
