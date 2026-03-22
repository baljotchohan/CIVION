# CIVION V1 — Personal AI Intelligence Network

A standalone frontend-only app that gives you a personal AI intelligence network with 5 debate agents and a personal assistant, powered by Google Gemini.

**No backend. No database. Pure React/Next.js.**

## Quick Start

```bash
npm install
npm run dev
```

Then go to [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Onboarding** — Enter your name, business, goals, and Gemini API key
2. **Dashboard** — Chat with your Personal Agent and launch 5-agent debates
3. **Goals** — Track objectives with AI-powered analysis
4. **Settings** — Manage your profile and API key

## Architecture

```
ui/src/
├── agents/         # 5 debate agents + personal agent (TypeScript)
├── services/       # Gemini API client + localStorage manager
├── store/          # Zustand state (user profile, agent interactions)
├── app/            # Next.js pages (dashboard, onboarding, goals, settings)
├── components/     # UI components (sidebar, topbar, nick panel, cards)
└── lib/            # Theme system, utilities
```

## Requirements

- Node.js 18+
- A Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)

## Data Storage

All data is stored in your browser's `localStorage`:
- User profile (name, business, goals)
- Gemini API key (Base64 encoded)
- Conversation history
- Goal analyses
- Debate results

## Future (Phase 2)

- Firebase for user accounts and cloud storage
- Multi-device sync
- Team features
