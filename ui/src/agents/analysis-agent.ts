// Analysis Agent — provides deep analytical insights

import { ClaudeClient } from "@/services/claude-api";
import { AgentResponse } from "./types";

export class AnalysisAgent {
  private claude: ClaudeClient;

  constructor(claude: ClaudeClient) {
    this.claude = claude;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `As an Analysis Agent, provide deep analysis on:
"${topic}"

Cover:
1. Key patterns and underlying dynamics
2. Root causes and driving factors
3. Comparative analysis (vs. alternatives or benchmarks)
4. Risk assessment and potential pitfalls
5. Data-driven insights and actionable takeaways

Be analytical and precise. Focus on patterns others might miss.`;

    const analysis = await this.claude.generate(prompt);
    return {
      agent: "Analysis Agent",
      analysis,
      confidence: 0.82,
    };
  }
}
