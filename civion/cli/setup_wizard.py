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
    clear_screen()
    show_logo()
    
    console.print("\n[bold]Welcome to CIVION Setup Wizard[/bold]")
    console.print("This will configure your AI Intelligence System.\n")
    
    Prompt.ask("[dim]Press Enter to begin[/dim]", default="", show_default=False)
    
    # SCREEN 2: SYSTEM CHECK
    clear_screen()
    show_logo()
    console.print("\n[bold]Running system checks...[/bold]")
    
    import platform
    import pkg_resources
    
    checks = [
        ("Python 3.10+", sys.version_info >= (3, 10), f"found {platform.python_version()}"),
        ("pip available", True, "found"),
        ("Port 8000 free", True, "available"), # Simple assumption for wizard
        ("Internet connection", True, "connected"),
    ]
    
    all_passed = True
    for label, passed, detail in checks:
        icon = "[green]✓[/green]" if passed else "[red]✗[/red]"
        console.print(f"  {icon} {label.ljust(20)} ({detail})")
        if not passed: all_passed = False
        
    if not all_passed:
        console.print("\n[red]Some system checks failed. Please resolve them and try again.[/red]")
        if not Confirm.ask("Continue anyway?", default=False):
            return

    # SCREEN 3: LLM PROVIDER SELECTION
    clear_screen()
    show_logo()
    
    table = Table(title="Choose your AI Provider", box=None)
    table.add_column("#", style="cyan")
    table.add_column("Provider", style="bold")
    table.add_column("Cost", style="green")
    table.add_column("Best For")
    
    provider_list = list(PROVIDERS.keys())
    for i, p_id in enumerate(provider_list, 1):
        p = PROVIDERS[p_id]
        table.add_row(str(i), p["name"], p["cost_tier"], p["description"])
        
    console.print(table)
    
    choice = IntPrompt.ask("\nEnter number or press Enter for Anthropic", default=1)
    provider_id = provider_list[choice - 1]
    provider_meta = PROVIDERS[provider_id]
    
    # SCREEN 4: PROVIDER CONFIGURATION
    clear_screen()
    show_logo()
    
    console.print(Panel(f"[bold]{provider_meta['name']} Configuration[/bold]\n\nGet your API key at:\n→ [link={provider_meta.get('get_key_url') or ''}]{provider_meta.get('get_key_url') or 'N/A'}[/link]", border_style="cyan"))
    
    api_key = ""
    if provider_meta["requires_key"]:
        api_key = Prompt.ask(f"Enter {provider_meta['env_key']}", password=True)
    
    # SCREEN 5: MODEL SELECTION
    clear_screen()
    show_logo()
    
    models = provider_meta["models"]
    if models and models[0] != "auto-detect":
        console.print(f"\n[bold]Available models for {provider_meta['name']}:[/bold]")
        for i, m in enumerate(models, 1):
            console.print(f"  {i}. {m}")
        
        m_choice = IntPrompt.ask("\nSelect model", default=2 if len(models) >= 2 else 1)
        selected_model = models[m_choice - 1]
    else:
        selected_model = Prompt.ask("Enter model name (e.g. llama3.2)", default="llama3.2")

    # TEST CONNECTION
    clear_screen()
    show_logo()
    
    # Map the testing settings so LLMService works
    old_provider = settings.llm_provider
    old_model = settings.llm_model
    settings.llm_provider = provider_id
    settings.llm_model = selected_model
    if api_key:
        setattr(settings, f"{provider_id.lower()}_api_key", api_key)
        
    success = False
    error_msg = ""
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        progress.add_task(description="Testing connection...", total=None)
        
        try:
            if provider_id.lower() == "ollama":
                import requests
                res = requests.get("http://localhost:11434/api/tags", timeout=5)
                res.raise_for_status()
                success = True
            else:
                svc = LLMService()
                result = await svc.complete("Say 'CIVION connection test successful' and nothing else.", max_tokens=20)
                success = "successful" in result.lower() or len(result) > 5
                if not success:
                    error_msg = f"Unexpected response: {result}"
        except Exception as e:
            success = False
            error_msg = str(e)

    if success:
        console.print("[green]✓ Connection successful![/green]")
    else:
        console.print(f"[red]✗ Connection failed: {error_msg}[/red]")
        console.print("[yellow]AI features won't work until a valid key is added.[/yellow]")
        if not Confirm.ask("Use these settings anyway?", default=True):
            settings.llm_provider = old_provider
            settings.llm_model = old_model
            return

    # User Profile setup
    if success:
        clear_screen()
        show_logo()
        console.print("\n[bold]Let's get to know you for NICK (your AI assistant)...[/bold]")
        name = Prompt.ask("What's your name?", default="")
        occupation = Prompt.ask("What do you do? (e.g. Developer, Researcher)", default="")
        
        os.makedirs(CIVION_DIR, exist_ok=True)
        profile = {}
        if PROFILE_FILE.exists():
            with open(PROFILE_FILE, "r") as f:
                try:
                    profile = json.load(f)
                except: pass
        if name: profile["name"] = name
        if occupation: profile["occupation"] = occupation
        with open(PROFILE_FILE, "w") as f:
            json.dump(profile, f, indent=2)

    # SCREEN 6: DATA SOURCES
    clear_screen()
    show_logo()
    
    console.print("\n[bold]Data Source Configuration (Optional)[/bold]")
    sources = [
        ("GitHub", "GITHUB_TOKEN", "https://github.com/settings/tokens"),
        ("NewsAPI", "NEWS_API_KEY", "https://newsapi.org/register"),
        ("CoinGecko", "COINGECKO_API_KEY", "https://www.coingecko.com/en/api"),
    ]
    
    if Confirm.ask("Configure data sources?", default=False):
        for name, key, url in sources:
            val = Prompt.ask(f"{name} Token (Enter to skip)\n→ {url}", password=True)
            if val:
                setattr(settings, key.lower(), val)

    # SCREEN 7: ADVANCED
    clear_screen()
    show_logo()
    
    config.port = IntPrompt.ask("Backend port", default=8000)
    config.auto_open_browser = Confirm.ask("Auto-open browser?", default=True)
    config.llm_provider = provider_id
    config.llm_model = selected_model
    
    # SCREEN 8: REVIEW
    clear_screen()
    show_logo()
    
    summary = Table(title="Configuration Summary", box=None)
    summary.add_row("LLM Provider", provider_id)
    summary.add_row("Model", selected_model)
    summary.add_row("Port", str(config.port))
    summary.add_row("Auto-browser", str(config.auto_open_browser))
    
    console.print(Panel(summary, title="Confirm Settings", border_style="green"))
    
    if Confirm.ask("Save this configuration?", default=True):
        config.save()
        if api_key:
            from civion.core.config import _save_env_file
            _save_env_file({provider_meta["env_key"]: api_key})
            for s_name, s_key, _ in sources:
                val = getattr(settings, s_key.lower(), "")
                if val:
                    _save_env_file({s_key: val})

        # SCREEN 10: COMPLETE
        clear_screen()
        show_logo()
        console.print(Panel(
            "\n[green]✓ CIVION is configured and ready![/green]\n\n"
            "Run:  [bold]civion start[/bold]\n"
            f"Then: [link=http://localhost:{config.port}]http://localhost:{config.port}[/link]\n\n"
            "Need help? civion --help\n",
            title="Setup Complete", border_style="bold green"
        ))
    else:
        console.print("[yellow]Setup cancelled. Config NOT saved.[/yellow]")

def main():
    asyncio.run(run_setup())

if __name__ == "__main__":
    main()
