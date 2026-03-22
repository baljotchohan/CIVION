// Monitoring Agent — tracks progress and provides status assessments

import { ClaudeClient } from "@/services/claude-api";
import { AgentResponse } from "./types";

export class MonitoringAgent {
  private claude: ClaudeClient;

  constructor(claude: ClaudeClient) {
    this.claude = claude;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `As a Monitoring Agent, assess progress and health for:
"${topic}"

Provide:
1. Current status assessment (vs. expected targets)
2. Trend analysis — improving, stable, or declining
3. Health indicators and warning signs
4. Key alerts that need attention
5. Recommended adjustments to stay on track

Be vigilant and proactive. Flag risks early.`;

    const analysis = await this.claude.generate(prompt);
    return {
      agent: "Monitoring Agent",
      analysis,
      confidence: 0.83,
    };
  }
}
