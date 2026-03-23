// Monitoring Agent — tracks progress and provides status assessments

import { GeminiClient } from "@/services/gemini-api";
import { AgentResponse } from "./types";

export class MonitoringAgent {
  private gemini: GeminiClient;

  constructor(gemini: GeminiClient) {
    this.gemini = gemini;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `As a Monitoring Agent, assess progress and health for:
Identify potential roadblocks and trackable metrics for this topic: "${topic}".

Format your output STRICTLY:
- List 2-3 **Key Risks**.
- List 1-2 **Success Metrics**.
- Be vigilant and proactive. Flag issues clearly and concisely.`;

    const analysis = await this.gemini.generate(prompt);
    return {
      agent: "Monitoring Agent",
      analysis,
      confidence: 0.83,
    };
  }
}
