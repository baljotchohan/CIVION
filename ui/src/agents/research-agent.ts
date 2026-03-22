// Research Agent — provides research and trend analysis

import { GeminiClient } from "@/services/gemini-api";
import { AgentResponse } from "./types";

export class ResearchAgent {
  private gemini: GeminiClient;

  constructor(gemini: GeminiClient) {
    this.gemini = gemini;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `Analyze the market trends and external factors for this topic: "${topic}".

Format your output STRICTLY:
- Use a bulleted list to highlight 2-3 key trends.
- Use **bold** for specific statistics or core insights.
- Write like a concise intelligence report. Be objective and direct.`;

    const analysis = await this.gemini.generate(prompt);
    return {
      agent: "Research Agent",
      analysis,
      confidence: 0.80,
    };
  }
}
