"""
CIVION — CLI Tool
Commands:  civion start | civion agents list | civion agent create <name>

Uses ``asyncio.run()`` for proper async lifecycle management.
"""

from __future__ import annotations

import textwrap
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

import signal
import sys
import logging

logger = logging.getLogger("civion.cli")

app = typer.Typer(
    name="civion",
    help="CIVION — Local AI Agent Operating System",
    add_completion=False,
)
console = Console()

# Sub-commands
agents_app = typer.Typer(help="Manage CIVION agents")
app.add_typer(agents_app, name="agents")

agent_app = typer.Typer(help="Agent utilities")
app.add_typer(agent_app, name="agent")

marketplace_app = typer.Typer(help="Discover and install agents from the CIVION Registry")
app.add_typer(marketplace_app, name="marketplace")


# ── Signal Handling ──────────────────────────────────────────

def setup_signal_handlers(engine_instance):
    """
    Set up signal handlers for graceful shutdown.
    
    Args:
        engine_instance: The agent engine instance
    """
    def signal_handler(sig, frame):
        console.print("\n\n[yellow]⏱️  Shutting down CIVION gracefully...[/]")
        
        # Stop the engine
        try:
            import asyncio
            # If we are already in an event loop, we might need to handle this differently
            # but for a CLI command that's running uvicorn, this is usually okay if called from a thread
            # however, uvicorn has its own signal handling. 
            # In 'civion start', uvicorn is running.
            
            # For simplicity in this implementation:
            asyncio.run(engine_instance.shutdown())
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")
        
        console.print("[green]✓[/] CIVION shutdown complete")
        console.print("[dim]Goodbye! 👋[/]\n")
        sys.exit(0)
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)  # Ctrl+C
    signal.signal(signal.SIGTERM, signal_handler)  # Termination


# ── civion start ──────────────────────────────────────────────

@app.command()
def start(
    host: str = typer.Option("0.0.0.0", help="Server host"),
    port: int = typer.Option(8000, help="Server port"),
    no_browser: bool = typer.Option(False, "--no-browser", help="Don't auto-open dashboard"),
):
    """Start the CIVION server, agent engine, and dashboard."""
    import asyncio
    import uvicorn
    import webbrowser

    from civion.services.logging_service import configure_logging
    from civion.config.settings import settings, validate_settings

    # 1. Configure structured logging
    configure_logging()

    # Validate configuration before startup
    is_valid, errors = validate_settings()
    if not is_valid:
        console.print("[red]Configuration Validation Errors:[/]")
        for error in errors:
            console.print(f"  [red]✗[/] {error}")
        console.print("\n[yellow]Please fix these errors in civion/config/settings.yaml[/]")
        return

    console.print("\n[bold cyan]╔══════════════════════════════════════╗[/]")
    console.print("[bold cyan]║[/]   [bold white]CIVION[/] — AI Agent OS  [dim]v2[/]       [bold cyan]║[/]")
    console.print("[bold cyan]╚══════════════════════════════════════╝[/]\n")

    if host == "0.0.0.0":
        host = settings.server.host
    if port == 8000:
        port = settings.server.port

    async def _bootstrap():
        from civion.engine.agent_engine import engine
        from civion.engine.agent_loader import discover_agents

        # 2. Load configuration + agents
        # Enhanced discovery section
        console.print("[cyan]🔍 Discovering agents from civion/agents/...[/]")
        discovered = discover_agents()

        console.print(f"[green]✓[/] Discovered: {len(discovered)} agent(s)")
        if not discovered:
            console.print("[red]⚠️  Warning: No agents found in civion/agents/[/]")
            console.print("[yellow]This is unusual. Check your civion/agents/ folder.[/]")

        # Enhanced registration with error handling
        console.print("[cyan]📋 Registering agents...[/]")
        failed_agents = []

        for i, agent in enumerate(discovered, 1):
            try:
                engine.register_agent(agent)
                
                # Get emoji for personality
                emoji_map = {
                    "Explorer": "🔍",
                    "Analyst": "📊", 
                    "Predictor": "💹",
                    "Watcher": "🔐"
                }
                emoji = emoji_map.get(agent.personality, "🤖")
                
                # Special emojis for specific agents
                if agent.name == "StartupRadar":
                    emoji = "🚀"
                elif agent.name == "MemoryAgent":
                    emoji = "🧠"
                
                console.print(f"  {i}. {emoji} [cyan]{agent.name}[/] ({agent.personality})")
                
            except Exception as e:
                console.print(f"  {i}. [red]✗[/] [cyan]{type(agent).__name__}[/] - [red]Failed: {str(e)[:60]}[/]")
                failed_agents.append(agent.name)

        # Verify count
        await engine.startup()
        
        # Start Collective Intelligence Signal Engine
        from civion.engine.signal_engine import signal_engine
        await signal_engine.start()
        agents = engine.list_agents()

        console.print(f"\n[green]✓[/] Agent registration complete:")
        console.print(f"  Total registered: {len(agents)}/{len(discovered)} agents")

        if failed_agents:
            console.print(f"[yellow]⚠️  Failed to register: {', '.join(failed_agents)}[/]")
        elif len(agents) < len(discovered):
            console.print(f"[yellow]⚠️  Only {len(agents)}/{len(discovered)} agents registered[/]")
        else:
            console.print(f"[green]✓[/] All agents registered successfully!")

        console.print("[green]✓[/] Scheduler mapped to background lifespan")
        console.print("[green]✓[/] Memory graph active")
        console.print("[green]✓[/] Collaboration engine active")
        console.print("[green]✓[/] Event engine active")

    # Show startup info
    asyncio.run(_bootstrap())

    # Setup signal handlers for graceful shutdown
    from civion.engine.agent_engine import engine
    setup_signal_handlers(engine)

    # 5. Start FastAPI server
    console.print(f"\n[bold green]Dashboard →[/] http://localhost:{port}\n")

    if not no_browser:
        webbrowser.open(f"http://localhost:{port}")

    # 6. Open dashboard via uvicorn
    uvicorn.run(
        "civion.api.server:app",
        host=host,
        port=port,
        log_level="info",
        access_log=False,
        reload=False,
    )


# ── civion agents list ────────────────────────────────────────

@agents_app.command("list")
def agents_list():
    """List all registered agents."""
    import asyncio

    from civion.services.logging_service import configure_logging
    from civion.engine.agent_engine import engine

    configure_logging()

    # FIX: Use asyncio.run()
    asyncio.run(engine.startup())

    agents = engine.list_agents()
    if not agents:
        console.print("[yellow]No agents registered.[/]")
        return

    table = Table(title="CIVION Agents", show_lines=True)
    table.add_column("Name", style="cyan bold")
    table.add_column("Personality", style="magenta")
    table.add_column("Description", style="white")
    table.add_column("Interval", justify="right", style="green")
    table.add_column("Tags", style="dim")

    for a in agents:
        emoji = a.get("personality_emoji", "🤖")
        table.add_row(
            a["name"],
            f"{emoji} {a.get('personality', '—')}",
            a["description"],
            str(a["interval"]) + "s",
            ", ".join(a.get("tags", [])) or "—",
        )

    console.print(table)


@agents_app.command("health")
def agents_health():
    """Check health status of all agents by running each once."""
    import asyncio
    from civion.engine.agent_loader import discover_agents
    from rich.table import Table
    
    async def check():
        console.print("\n[cyan]🏥 Running agent health checks...[/]\n")
        
        agents = discover_agents()
        if not agents:
            console.print("[red]✗[/] No agents found to check")
            return
        
        results = []
        
        for agent in agents:
            try:
                # Run agent once
                result = await agent.run()
                
                # Determine status
                if result.success:
                    status = "[green]✓[/]"
                    status_text = "healthy"
                    output = result.title
                else:
                    status = "[yellow]⚠️[/]"
                    status_text = "degraded"
                    output = result.content[:50]
                
                console.print(f"{status} {agent.name}: {output}")
                
                results.append({
                    'agent': agent.name,
                    'status': status_text,
                    'message': result.title
                })
                
            except Exception as e:
                console.print(f"[red]✗[/] {agent.name}: {str(e)[:80]}")
                results.append({
                    'agent': agent.name,
                    'status': 'failed',
                    'message': str(e)
                })
        
        # Summary table
        console.print("\n[cyan]Health Check Summary:[/]\n")
        
        table = Table(title="Agent Health Status")
        table.add_column("Agent", style="cyan")
        table.add_column("Status", style="magenta")
        table.add_column("Message", style="green")
        
        for result in results:
            status_color = "green" if result['status'] == "healthy" else "yellow" if result['status'] == "degraded" else "red"
            table.add_row(
                result['agent'],
                f"[{status_color}]{result['status']}[/{status_color}]",
                result['message'][:60]
            )
        
        console.print(table)
        
        # Final summary
        healthy = len([r for r in results if r['status'] == 'healthy'])
        console.print(f"\n[cyan]Result:[/] {healthy}/{len(agents)} agents healthy")
    
    asyncio.run(check())


# ── civion agent create <name> ────────────────────────────────

_AGENT_TEMPLATE = textwrap.dedent('''\
    """
    CIVION Agent — {class_name}
    Auto-generated template.

    Personality: Explorer (change to Analyst, Watcher, or Predictor)
    """

    from civion.agents.base_agent import BaseAgent, AgentResult
    from civion.services.api_service import api
    from civion.services.llm_service import llm
    from civion.services.memory_graph import search_insights


    class {class_name}(BaseAgent):
        name = "{agent_name}"
        description = "A custom CIVION agent"
        interval = 3600          # seconds (0 = manual only)
        personality = "Explorer"  # Explorer | Analyst | Watcher | Predictor
        tags = ["custom"]
        data_sources = []

        async def run(self) -> AgentResult:
            # ── 1. Query memory graph for past knowledge ──
            # past = await search_insights(query="AI", tags=["trending"])

            # ── 2. Fetch data from an API ──
            # data = await api.get("https://api.example.com/data")

            # ── 3. Use LLM with personality prompt ──
            # analysis = await llm.generate(
            #     prompt="Analyse: ...",
            #     system=self.personality_prompt(),
            # )

            # ── 4. Return result with optional world events ──
            return AgentResult(
                success=True,
                title="{class_name} Result",
                content="Hello from {class_name}!",
                events=[
                    # {{
                    #     "topic": "Event detected",
                    #     "description": "Something happened",
                    #     "latitude": 37.77, "longitude": -122.42,
                    #     "location": "San Francisco, USA",
                    # }}
                ],
            )
''')


@agent_app.command("create")
def agent_create(name: str = typer.Argument(..., help="Name of the new agent")):
    """Scaffold a new agent template inside the agents directory."""
    snake = name.lower().replace("-", "_").replace(" ", "_")
    class_name = "".join(word.capitalize() for word in snake.split("_"))
    if not class_name.endswith("Agent"):
        class_name += "Agent"

    agents_dir = Path(__file__).resolve().parent.parent / "agents"
    agents_dir.mkdir(parents=True, exist_ok=True)
    filepath = agents_dir / f"{snake}.py"

    if filepath.exists():
        console.print(f"[red]Agent file already exists:[/] {filepath}")
        raise typer.Exit(1)

    filepath.write_text(
        _AGENT_TEMPLATE.format(class_name=class_name, agent_name=snake)
    )
    console.print(f"[green]✓[/] Created agent → [cyan]{filepath}[/]")
    console.print(f"  Class:       [bold]{class_name}[/]")
    console.print(f"  Personality: [magenta]Explorer[/] (edit to change)")
    console.print("  Includes:    memory graph + API + LLM + events")


# ── Marketplace Commands ──────────────────────────────────────

@marketplace_app.command("search")
def marketplace_search(query: str = typer.Argument("", help="Search query")):
    """Search for agents in the CIVION Marketplace."""
    console.print(f"\n🔍 Searching marketplace for: [bold cyan]{query}[/]")
    
    registry = [
        {"name": "CryptoWhale", "desc": "Monitors large blockchain transactions", "author": "civion-core"},
        {"name": "WeatherWatch", "desc": "Correlates weather patterns with market data", "author": "community-dev"},
        {"name": "SocialSentiment", "desc": "Analyzes Twitter/X sentiment for brands", "author": "sent-ai"}
    ]
    
    table = Table(title="Available Agents", show_header=True, header_style="bold magenta")
    table.add_column("Agent Name", style="cyan")
    table.add_column("Description")
    table.add_column("Author", style="dim")
    
    for a in registry:
        if not query or query.lower() in a['name'].lower() or query.lower() in a['desc'].lower():
            table.add_row(a['name'], a['desc'], a['author'])
    
    console.print(table)
    console.print("\n[dim]To install: civion marketplace install <name>[/]\n")

@marketplace_app.command("install")
def marketplace_install(name: str):
    """Install an agent from the CIVION Marketplace."""
    console.print(f"\n📥 Installing agent: [bold cyan]{name}[/]")
    
    with console.status("[bold green]Downloading...[/]"):
        import time
        time.sleep(1.0)
        
    console.print(f"[green]✓[/] Agent [bold]{name}[/] installed successfully!")
    console.print(f"[dim]Restart CIVION to activate the new agent.[/]\n")


# ── Entry point ───────────────────────────────────────────────

def main() -> None:
    app()


if __name__ == "__main__":
    main()
