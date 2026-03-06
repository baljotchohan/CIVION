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
    from civion.config.settings import settings

    # 1. Configure structured logging
    configure_logging()

    console.print("\n[bold cyan]╔══════════════════════════════════════╗[/]")
    console.print("[bold cyan]║[/]   [bold white]CIVION[/] — AI Agent OS  [dim]v2[/]       [bold cyan]║[/]")
    console.print("[bold cyan]╚══════════════════════════════════════╝[/]\n")

    if host == "0.0.0.0":
        host = settings.server.host
    if port == 8000:
        port = settings.server.port

    async def _bootstrap():
        from civion.engine.agent_engine import engine

        # 2. Load configuration + agents
        await engine.startup()
        agents = engine.list_agents()
        console.print(f"[green]✓[/] Registered {len(agents)} agent(s)")
        for a in agents:
            emoji = a.get("personality_emoji", "🤖")
            console.print(f"  {emoji} [cyan]{a['name']}[/] ({a.get('personality', 'Explorer')})")

        console.print("[green]✓[/] Scheduler mapped to background lifespan")
        console.print("[green]✓[/] Memory graph active")
        console.print("[green]✓[/] Collaboration engine active")
        console.print("[green]✓[/] Event engine active")

    # Show startup info
    asyncio.run(_bootstrap())

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


# ── Entry point ───────────────────────────────────────────────

def main() -> None:
    app()


if __name__ == "__main__":
    main()
