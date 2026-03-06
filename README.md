# CIVION — Local AI Agent Operating System

CIVION is a developer-first, fully local AI agent platform. Install it, run it, connect your own LLM providers, and create custom AI agents that collect data, analyse it, and generate insights — all on your machine.

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start everything (server + agents + dashboard)
python main.py start

# 3. Open the dashboard
#    → http://localhost:8000
```

## CLI Commands

| Command | Description |
|---|---|
| `python main.py start` | Start server, engine & dashboard |
| `python main.py agents list` | List all registered agents |
| `python main.py agent create my_agent` | Scaffold a new agent |

## Project Structure

```
civion/
  cli/main.py           ← Typer CLI
  engine/
    agent_engine.py      ← Central agent engine
    scheduler.py         ← APScheduler-based recurring runs
  agents/
    base_agent.py        ← Abstract base class
    trend_agent.py       ← GitHub trending repos agent
  api/
    server.py            ← FastAPI REST + dashboard
    templates/           ← Jinja2 HTML
    static/              ← CSS assets
  services/
    llm_service.py       ← Ollama / OpenAI / Gemini
    api_service.py       ← Async HTTP helper
  storage/
    database.py          ← SQLite persistence
  config/
    settings.py          ← YAML config loader
    settings.yaml        ← Default settings
  data/                  ← SQLite DB lives here
main.py                  ← Entry point
requirements.txt
```

## LLM Configuration

Edit `civion/config/settings.yaml`:

```yaml
llm:
  provider: "ollama"           # ollama | openai | gemini
  model: "llama3"
  ollama_url: "http://localhost:11434"
  openai_api_key: "sk-..."
  gemini_api_key: "AI..."
```

## Creating Custom Agents

```bash
python main.py agent create market_scanner
```

This creates `civion/agents/market_scanner.py` with a ready-to-edit template. Implement the `run()` method and restart CIVION — the engine auto-discovers new agents.

## License

MIT