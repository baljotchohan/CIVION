<div align="center">

# 🧠 CIVION

### Local AI Agent Operating System

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](https://github.com/baljotchohan/civion/pulls)

**CIVION** is a developer-first platform where autonomous AI agents run on your machine, collect data from APIs, analyze it with LLMs, collaborate with each other, and generate real-time intelligence signals.

*Think of it as a distributed AI research network — running entirely on your laptop.*

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [Create Agents](#-create-your-own-agent) · [Dashboard](#-dashboard) · [Contributing](#-contributing)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Autonomous Agents** | Modular agents that run on schedules, fetch APIs, and produce insights |
| 🧠 **Memory Graph** | Shared knowledge system — agents remember and build on previous discoveries |
| 🔗 **Collaboration Engine** | Cross-agent analysis generates higher-level intelligence signals |
| 🌍 **World Map** | Geo-located events visualized on an interactive Leaflet map |
| 🎭 **Agent Personalities** | Explorer · Analyst · Watcher · Predictor — each with distinct LLM behavior |
| 🔒 **Sandboxed Execution** | Agents run in a controlled environment with safe file/HTTP/command access |
| 📊 **Live Dashboard** | Premium dark-themed dashboard with real-time stats, logs, and visualizations |
| 🔌 **Multi-LLM Support** | Ollama (local), OpenAI, and Google Gemini — switch with one config line |
| ⚡ **Dynamic Agent Loader** | Drop a `.py` file into `agents/` and it's auto-discovered on next startup |
| 📋 **Structured Logging** | Coloured terminal output + DB-backed log history |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Ollama** (optional, for local LLM) — [Install Ollama](https://ollama.com)

### Install

```bash
# Clone the repository
git clone https://github.com/baljotchohan/civion.git
cd civion

# Install as a package (creates global 'civion' command)
pip install -e .

# Start CIVION
civion start

# Troubleshooting: If 'civion' command is not found:
# Windows:  .\civion.bat start
# Mac/Linux: ./civion start
# Fallback:  python main.py start
```

Dashboard opens at **http://localhost:8000** 🎉

### Quick Commands

```bash
civion start                  # Start server + agents + dashboard
civion start --no-browser     # Start without opening browser
civion agents list            # List all registered agents
civion agent create my_bot    # Scaffold a new agent
```

---

## 🏗️ Architecture

```
civion/
├── cli/
│   └── main.py                  # CLI entry point (civion start|agents|agent)
├── engine/
│   ├── agent_engine.py          # Agent lifecycle manager
│   ├── agent_loader.py          # Dynamic agent discovery (pkgutil)
│   ├── scheduler.py             # APScheduler-based recurring runs
│   ├── collaboration_engine.py  # Cross-agent signal synthesis
│   ├── event_engine.py          # Geo-located event emission
│   └── sandbox.py               # Controlled execution environment
├── agents/
│   ├── base_agent.py            # Base class + personalities
│   └── trend_agent.py           # Example: GitHub trending repos
├── services/
│   ├── llm_service.py           # Multi-provider LLM (Ollama/OpenAI/Gemini)
│   ├── api_service.py           # Async HTTP helper
│   ├── memory_graph.py          # Shared knowledge graph
│   ├── insights_service.py      # Dual-storage insights
│   └── logging_service.py       # Structured logging
├── storage/
│   └── database.py              # SQLite with 8 tables
├── api/
│   ├── server.py                # FastAPI server (10 endpoints)
│   ├── templates/dashboard.html # Dashboard UI
│   └── static/style.css         # Premium dark theme
├── config/
│   └── settings.py              # YAML-based configuration
├── main.py                      # Entry point
└── pyproject.toml               # Package configuration
```

---

## 🎭 Agent Personalities

Every agent has a personality that shapes its LLM prompts and behavior:

| Personality | Emoji | Behavior |
|---|---|---|
| **Explorer** | 🔍 | Discovers new data sources, finds unexpected connections |
| **Analyst** | 📊 | Deep reasoning, comparative analysis, structured reports |
| **Watcher** | 👁️ | Monitors for anomalies, detects changes, raises alerts |
| **Predictor** | 🔮 | Forecasting, trend projection, scenario modeling |

---

## 🤖 Create Your Own Agent

```bash
civion agent create weather_monitor
```

This generates a template at `civion/agents/weather_monitor.py`:

```python
from civion.agents.base_agent import BaseAgent, AgentResult
from civion.services.api_service import api
from civion.services.llm_service import llm

class WeatherMonitorAgent(BaseAgent):
    name = "weather_monitor"
    description = "A custom CIVION agent"
    personality = "Watcher"
    interval = 3600
    tags = ["weather"]

    async def run(self) -> AgentResult:
        # 1. Fetch data from an API
        data = await api.get("https://api.weather.gov/alerts/active")

        # 2. Analyze with LLM
        analysis = await llm.generate(
            prompt=f"Analyze these weather alerts: {data}",
            system=self.personality_prompt(),
        )

        # 3. Return result with world map events
        return AgentResult(
            success=True,
            title="Weather Alert Analysis",
            content=analysis,
            events=[{
                "topic": "Severe Weather Alert",
                "description": "Storm warning detected",
                "latitude": 40.71, "longitude": -74.01,
                "location": "New York, USA",
            }],
        )
```

Drop the file in `agents/` → restart → it's auto-discovered. That's it.

---

## 📊 Dashboard

The dashboard at `http://localhost:8000` includes:

| Tab | Shows |
|---|---|
| **Overview** | Active agents, personality badges, collaboration signals, insights, logs |
| **World Map** | Interactive Leaflet map with geo-located agent events |
| **Knowledge Graph** | Visual canvas showing memory nodes and their connections |
| **History** | Complete run history with status indicators |

---

## 🔌 LLM Configuration

Edit `config/settings.yaml`:

```yaml
llm:
  # Option 1: Ollama (local, free)
  provider: ollama
  model: llama3.2
  ollama_url: http://localhost:11434

  # Option 2: OpenAI
  # provider: openai
  # model: gpt-4
  # openai_api_key: sk-...

  # Option 3: Gemini
  # provider: gemini
  # model: gemini-pro
  # gemini_api_key: ...
```

---

## 🛣️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Dashboard |
| `GET` | `/api/agents` | List agents |
| `GET` | `/api/insights` | Latest insights |
| `GET` | `/api/logs` | Structured logs |
| `GET` | `/api/runs` | Run history |
| `GET` | `/api/signals` | Collaboration signals |
| `GET` | `/api/memory` | Knowledge graph |
| `GET` | `/api/memory/search?q=AI` | Search memory |
| `GET` | `/api/events` | World map events |
| `POST` | `/api/agents/{name}/run` | Trigger agent |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-agent`
3. Create your agent in `civion/agents/`
4. Commit: `git commit -m 'feat: add amazing agent'`
5. Push: `git push origin feature/amazing-agent`
6. Open a Pull Request

---

## 🛠️ Troubleshooting

### 'civion' is not recognized
If you get a "command not found" error after installation, it's because the Python scripts directory is not in your system `PATH`.

**Fixes:**
1. **Use the helper scripts:** Run `.\civion.bat start` (Windows) or `./civion start` (Mac/Linux) directly from the project root.
2. **Direct execution:** Run `python main.py start`.
3. **Permanent Fix (Windows):** Add `C:\Users\<YourUser>\AppData\Roaming\Python\Python314\Scripts` to your Environment Variables `Path`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Baljot Chohan](https://github.com/baljotchohan)**

⭐ Star this repo if you find it useful!

</div>