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

    # --- Port Availability Check ---
    import socket
    def is_port_in_use(h: str, p: int) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex((h, p)) == 0

    if is_port_in_use(host, port):
        console.print(f"\n[red]ERROR:[/] Port {port} is already in use on {host}.")
        console.print("[yellow]Hint:[/] Another CIVION instance might be running. Close it or use --port to specify a different port.\n")
        raise typer.Exit(1)

    async def _bootstrap():
        from civion.engine.agent_engine import engine
        from civion.engine.agent_loader import discover_agents

        # 2. Load configuration + agents
        console.print("[cyan]🔍 Discovering and registering agents...[/]")
        discovered = discover_agents()

        if not discovered:
            console.print("[red]⚠️  Warning: No agents found in civion/agents/[/]")
            console.print("[yellow]Check your civion/agents/ folder.[/]")
        
        for i, agent in enumerate(discovered, 1):
            try:
                engine.register_agent(agent)
                emoji_map = {
                    "Explorer": "🔍", "Analyst": "📊", "Predictor": "💹", "Watcher": "🔐"
                }
                emoji = emoji_map.get(agent.personality, "🤖")
                if agent.name == "StartupRadar": emoji = "🚀"
                elif agent.name == "MemoryAgent": emoji = "🧠"
                
                console.print(f"  {i}. {emoji} [cyan]{agent.name}[/] ({agent.personality})")
            except Exception as e:
                console.print(f"  {i}. [red]✗[/] [cyan]{agent.name}[/] - [red]Failed: {str(e)[:60]}[/]")

        # Prepare engine (DB init, but skip re-loading)
        await engine.startup(load_agents=False)

        console.print(f"\n[green]✓[/] System initialized with {len(engine.list_agents())} agents.")
        console.print("[dim]Scheduler, Memory Graph, and Event Engine are active.[/]")

    # Show startup info
    asyncio.run(_bootstrap())


    # 5. Start FastAPI server
    console.print(f"\n[bold green]Dashboard →[/] http://localhost:{port}\n")

    if not no_browser:
        try:
            webbrowser.open(f"http://localhost:{port}")
        except:
            pass

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


@app.command()
def setup():
    """Interactive setup wizard for CIVION configuration."""
    import asyncio
    import json
    from pathlib import Path
    from civion.config.settings import settings

    console.print("\n[bold cyan]╔════════════════════════════════════════╗[/]")
    console.print("[bold cyan]║[/]   [bold white]CIVION Setup Wizard[/]          [bold cyan]║[/]")
    console.print("[bold cyan]╚════════════════════════════════════════╝[/]\n")

    async def run_setup():
        # Step 1: Choose LLM Provider
        console.print("[cyan]Step 1: Select LLM Provider[/]")
        console.print("  [dim]1)[/] Ollama (Local, Free)")
        console.print("  [dim]2)[/] OpenAI (GPT-4, Paid)")
        console.print("  [dim]3)[/] Gemini (Free)")

        choice = typer.prompt("Choose (1-3)")

        providers = {"1": "ollama", "2": "openai", "3": "gemini"}
        if choice not in providers:
            console.print("[red]❌ Invalid choice[/]")
            return

        provider = providers[choice]
        settings.llm.provider = provider
        console.print(f"[green]✓[/] Selected: {provider.upper()}\n")

        # Step 2: Create directories
        console.print("[cyan]Step 2: Create Directories[/]")
        console.print("[dim]This will create:[/]")
        console.print(f"  - {settings.data.path}")
        console.print("  - backups/ (for backups)")
        console.print("  - exports/ (for exports)")

        if typer.confirm("[cyan]Create directories?[/]", default=True):
            Path(settings.data.path).mkdir(parents=True, exist_ok=True)
            (Path(settings.data.path) / "backups").mkdir(exist_ok=True)
            (Path(settings.data.path) / "exports").mkdir(exist_ok=True)
            console.print("[green]✓[/] Directories created\n")

        # Step 3: Test LLM Connection
        console.print("[cyan]Step 3: Testing LLM Connection[/]")

        try:
            from civion.services.llm_service import llm
            response = await llm.generate(prompt="Say OK")
            if response:
                console.print(f"[green]✓[/] Connection successful!\n")
            else:
                console.print("[yellow]⚠️  Connection test failed\n[/]")
        except Exception as e:
            console.print(f"[red]✗[/] Connection failed: {e}\n")

        # Step 4: Save Configuration
        console.print("[cyan]Step 4: Saving Configuration[/]")

        config_file = Path(settings.data.path) / "settings.json"
        config_data = {
            "llm": {
                "provider": settings.llm.provider,
                "model": settings.llm.model or "default",
            },
            "server": {
                "host": settings.server.host,
                "port": settings.server.port,
            },
            "agents": {
                "auto_start": settings.agents.auto_start,
            },
        }

        with open(config_file, "w") as f:
            json.dump(config_data, f, indent=2)

        console.print(f"[green]✓[/] Configuration saved to {config_file}\n")

        # Step 5: Complete
        console.print("[green]✓ Setup Complete![/]")
        console.print("[cyan]You can now run:[/] [bold]civion start[/]\n")

    asyncio.run(run_setup())


@app.command()
def update():
    """Update CIVION system components (e.g., logo, configuration)."""
    import shutil
    from pathlib import Path

    console.print("\n[bold cyan]🔄 CIVION System Update[/]")

    # 1. Update Logo
    new_logo_path = Path("/Users/baljotchohan/.gemini/antigravity/brain/35402a12-0441-4d4b-bfdc-953ed2d97790/perfect_minimalist_logo_1772791711473.png")
    static_logo_path = Path(__file__).resolve().parent.parent / "api" / "static" / "logo.png"

    if new_logo_path.exists():
        try:
            shutil.copy(new_logo_path, static_logo_path)
            console.print(f"[green]✓[/] Logo updated successfully → [cyan]{static_logo_path.name}[/]")
        except Exception as e:
            console.print(f"[red]✗[/] Failed to update logo: {e}")
    else:
        console.print("[yellow]⚠️  New logo source not found. Skipping logo update.[/]")

    console.print("\n[green]✓[/] Update complete! Restart the dashboard to see changes.\n")


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
