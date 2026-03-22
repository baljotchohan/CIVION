// Research Agent — provides research and trend analysis

import { GeminiClient } from "@/services/gemini-api";
import { AgentResponse } from "./types";

export class ResearchAgent {
  private gemini: GeminiClient;

  constructor(gemini: GeminiClient) {
    this.gemini = gemini;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `As a Research Agent, investigate this topic:
"${topic}"

Provide:
1. Current landscape and state of affairs
2. Key trends and developments
3. Best practices and proven approaches
4. Opportunities and untapped areas
5. Actionable recommendations

Be thorough but concise. Focus on practical insights.`;

    const analysis = await this.gemini.generate(prompt);
    return {
      agent: "Research Agent",
      analysis,
      confidence: 0.80,
    };
  }
}
