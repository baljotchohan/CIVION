// Goal Agent — analyzes and breaks down user goals

import { ClaudeClient } from "@/services/claude-api";
import { AgentResponse } from "./types";

export class GoalAgent {
  private claude: ClaudeClient;

  constructor(claude: ClaudeClient) {
    this.claude = claude;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `As a Goal Analysis Agent, analyze this objective:
"${topic}"

Provide:
1. Clear goal definition
2. Key milestones (3-5)
3. Estimated timeline
4. Success metrics
5. Feasibility assessment (1-10 scale)

Be specific, actionable, and concise.`;

    const analysis = await this.claude.generate(prompt);
    return {
      agent: "Goal Agent",
      analysis,
      confidence: 0.85,
    };
  }

  async analyzeGoal(goalText: string): Promise<string> {
    const prompt = `Analyze this goal in detail:
"${goalText}"

Provide a structured breakdown with:
1. **Clarified Goal** — restate it clearly
2. **Milestones** — 3-5 key milestones with estimated timeframes
3. **Success Metrics** — how to measure achievement
4. **Potential Blockers** — what could go wrong
5. **First Steps** — 3 immediate actions to start

Be actionable and specific.`;

    return await this.claude.generate(prompt);
  }
}
