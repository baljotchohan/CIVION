// Analysis Agent — provides deep analytical insights

import { GeminiClient } from "@/services/gemini-api";
import { AgentResponse } from "./types";

export class AnalysisAgent {
  private gemini: GeminiClient;

  constructor(gemini: GeminiClient) {
    this.gemini = gemini;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `As an Analyze the pros, cons, and risks of this topic: "${topic}".

Format your output STRICTLY:
- Create sections for **Pros**, **Cons**, and **Risks**.
- Use succinct bullet points.
- Stay analytical, detached, and data-driven. Keep it under 100 words.`;

    const analysis = await this.gemini.generate(prompt);
    return {
      agent: "Analysis Agent",
      analysis,
      confidence: 0.82,
    };
  }
}
