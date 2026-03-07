import typer
from rich.console import Console
from civion.engine.persona_system import persona_system
from civion.engine.network_engine import network_engine

console = Console()
app = typer.Typer(name="CIVION Command Line Interface")

@app.command()
def persona_create(
    name: str = typer.Argument(...),
    prompt: str = typer.Option(..., "--prompt"),
    style: str = typer.Option("analytical", "--style")
):
    """Create a custom analysis persona"""
    import asyncio
    
    async def _create():
        persona = await persona_system.create_persona(
            name=name,
            description="Custom CLI Persona",
            system_prompt=prompt,
            reasoning_style=style,
            user_id="local_user"
        )
        console.print(f"[green]✓[/] Persona created: {persona.name}")
        console.print(f"  ID: {persona.id}")
        console.print(f"  Style: {persona.reasoning_style}")

    asyncio.run(_create())

@app.command()
def network_join(network: str, peers: str = typer.Option(..., "--peers")):
    """Join a distributed intelligence network"""
    import asyncio
    
    async def _join():
        peer_urls = peers.split(",")
        await network_engine.join_network(network, peer_urls)
        console.print(f"[green]✓[/] Joined network: {network}")
        console.print(f"  Discovered peers: {len(network_engine.peers)}")
        console.print(f"  Sharing signals automatically")

    asyncio.run(_join())

@app.command()
def start(port: int = 8000):
    "Start the CIVION API server"
    import uvicorn
    console.print(f"[green]✓[/] Starting CIVION server on port {port}...")
    uvicorn.run("civion.api.server:app", host="0.0.0.0", port=port, reload=True)

if __name__ == "__main__":
    app()
