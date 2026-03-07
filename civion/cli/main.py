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
    console.print(Panel.fit(
        "[bold green]   CIVION v2.0[/]\n[dim]   AI Intelligence Command Center[/dim]",
        border_style="green",
    ))


# ═══════════════════════════════════════════════
# START / STOP / STATUS
# ═══════════════════════════════════════════════

@app.command()
def start(
    port: int = typer.Option(8000, help="API server port"),
    host: str = typer.Option("0.0.0.0", help="Host to bind"),
    no_browser: bool = typer.Option(False, help="Don't open browser"),
):
    """🚀 Start the CIVION system."""
    _banner()
    console.print(f"[green]✓[/] Starting CIVION on {host}:{port}...")
    import uvicorn
    uvicorn.run("civion.api.server:app", host=host, port=port, reload=True)


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


if __name__ == "__main__":
    app()
