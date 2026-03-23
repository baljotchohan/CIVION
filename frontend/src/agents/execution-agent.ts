// Execution Agent — creates concrete action plans

import { GeminiClient } from "@/services/gemini-api";
import { AgentResponse } from "./types";

export class ExecutionAgent {
  private gemini: GeminiClient;

  constructor(gemini: GeminiClient) {
    this.gemini = gemini;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `As an Execution Agent, provide an execution plan for this topic: "${topic}".

Format your output STRICTLY:
- Provide a clear, ordered list of **Action Items**.
- Highlight resource needs or immediate next steps in **bold**.
- Be pragmatic, direct, and focused on delivery.`;

    const analysis = await this.gemini.generate(prompt);
    return {
      agent: "Execution Agent",
      analysis,
      confidence: 0.85,
    };
  }
}
