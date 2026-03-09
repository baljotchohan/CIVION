"""
CIVION Setup Wizard
Interactive terminal configuration guide.
"""
import os
import sys
import time
import asyncio
import json
from pathlib import Path
from typing import List, Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Prompt, IntPrompt, Confirm

from civion.core.config import config, settings
from civion.services.provider_registry import PROVIDERS
from civion.services.llm_service import LLMService

console = Console()

CIVION_DIR = Path.home() / ".civion"
PROFILE_FILE = CIVION_DIR / "profile.json"

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def show_logo():
    logo = """
 ██████╗██╗██╗   ██╗██╗ ██████╗ ███╗  ██╗
██╔════╝██║██║   ██║██║██╔═══██╗████╗ ██║
██║     ██║╚██╗ ██╔╝██║██║   ██║██╔██╗██║
██║     ██║ ╚████╔╝ ██║██║   ██║██║╚████║
╚██████╗██║  ╚██╔╝  ██║╚██████╔╝██║ ╚███║
 ╚═════╝╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚══╝
    """
    console.print(Panel(logo, style="bold cyan", subtitle="AI Intelligence Command Center v2.0"))

async def run_setup():
    """Interactive setup wizard - complete implementation"""
    clear_screen()
    show_logo()
    
    console.print(Panel("[bold cyan]Welcome to CIVION![/bold cyan]"))
    
    # Step 1: Basic info
    name = Prompt.ask("Your name", default="User")
    
    # Step 2: LLM Model
    provider_list = list(PROVIDERS.keys())
    table = Table(title="Choose your AI Provider", box=None)
    table.add_column("#", style="cyan")
    table.add_column("Provider", style="bold")
    for i, p_id in enumerate(provider_list, 1):
        table.add_row(str(i), PROVIDERS[p_id]["name"])
    console.print(table)
    
    choice = IntPrompt.ask("Select provider", default=1)
    provider_id = provider_list[choice - 1]
    provider_meta = PROVIDERS[provider_id]
    
    # Step 3: API Key
    api_key = ""
    if provider_meta["requires_key"]:
        api_key = Prompt.ask(f"Enter {provider_meta['env_key']}", password=True)
    
    # Step 4: Model selection
    models = provider_meta["models"]
    console.print(f"\n[bold]Available models for {provider_meta['name']}:[/bold]")
    for i, m in enumerate(models, 1):
        console.print(f"  {i}. {m}")
    m_choice = IntPrompt.ask("Select model", default=1)
    selected_model = models[m_choice - 1]
    
    # Step 5: Save config
    config_dir = Path.home() / ".civion"
    config_dir.mkdir(exist_ok=True)
    
    config_data = {
        "name": name,
        "llm_provider": provider_id,
        "llm_model": selected_model,
        "port": 8000,
        "auto_open_browser": True
    }
    
    # Update global config object
    config.llm_provider = provider_id
    config.llm_model = selected_model
    config.save()
    
    if api_key:
        from civion.core.config import _save_env_file
        _save_env_file({provider_meta["env_key"]: api_key})
    
    # Step 6: Test connection
    console.print("\n[cyan]Testing connection...[/cyan]")
    success = False
    error_msg = ""
    try:
        if provider_id.lower() == "ollama":
            import requests
            res = requests.get("http://localhost:11434/api/tags", timeout=5)
            res.raise_for_status()
            success = True
        else:
            svc = LLMService()
            result = await svc.complete("Connection test", max_tokens=10)
            success = len(result) > 0
    except Exception as e:
        success = False
        error_msg = str(e)
    
    if success:
        console.print("[green]✓ Connection successful![/green]")
    else:
        console.print(f"[red]✗ Connection failed: {error_msg}[/red]")
        if not Confirm.ask("Use these settings anyway?", default=True):
            return

    console.print(Panel(
        "\n[green]✓ Setup complete![/green]\n\n"
        "Run: [bold]civion start[/bold] to begin.",
        title="Success", border_style="bold green"
    ))

def main():
    asyncio.run(run_setup())

if __name__ == "__main__":
    main()
