// Execution Agent — creates concrete action plans

import { ClaudeClient } from "@/services/claude-api";
import { AgentResponse } from "./types";

export class ExecutionAgent {
  private claude: ClaudeClient;

  constructor(claude: ClaudeClient) {
    this.claude = claude;
  }

  async analyze(topic: string): Promise<AgentResponse> {
    const prompt = `As an Execution Agent, create an actionable plan for:
"${topic}"

Include:
1. Step-by-step implementation actions
2. Timeline with specific phases
3. Resources and tools needed
4. Potential blockers and mitigations
5. Quick wins to build momentum

Be practical and execution-focused. Prioritize speed and impact.`;

    const analysis = await this.claude.generate(prompt);
    return {
      agent: "Execution Agent",
      analysis,
      confidence: 0.85,
    };
  }
}
