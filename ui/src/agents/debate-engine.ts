// Debate Engine — orchestrates 5-agent parallel debate on any topic

import { ClaudeClient } from "@/services/claude-api";
import { GoalAgent } from "./goal-agent";
import { ResearchAgent } from "./research-agent";
import { AnalysisAgent } from "./analysis-agent";
import { ExecutionAgent } from "./execution-agent";
import { MonitoringAgent } from "./monitoring-agent";
import { AgentResponse, DebateResult } from "./types";

export class DebateEngine {
  private claude: ClaudeClient;
  private agents: { analyze: (topic: string) => Promise<AgentResponse> }[];

  constructor(claude: ClaudeClient) {
    this.claude = claude;
    this.agents = [
      new GoalAgent(claude),
      new ResearchAgent(claude),
      new AnalysisAgent(claude),
      new ExecutionAgent(claude),
      new MonitoringAgent(claude),
    ];
  }

  async runDebate(topic: string): Promise<DebateResult> {
    // All 5 agents analyze in parallel
    const analyses = await Promise.all(
      this.agents.map((agent) => agent.analyze(topic))
    );

    // Calculate average confidence
    const confidences = analyses.map((a) => a.confidence);
    const avgConfidence =
      confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

    // Synthesize using Claude
    const synthesisPrompt = `You are the Synthesis Engine for a 5-agent debate on:
"${topic}"

Here are the analyses from each agent:

${analyses
  .map(
    (a, i) => `### ${a.agent} (Confidence: ${(a.confidence * 100).toFixed(0)}%)
${a.analysis}`
  )
  .join("\n\n---\n\n")}

Provide a final synthesis that:
1. **Key Agreements** — what all agents agree on
2. **Points of Divergence** — where agents differ and why
3. **Recommended Action** — the consensus best path forward
4. **Overall Assessment** — confidence level and reasoning

Be concise and decisive. Average confidence across agents: ${(avgConfidence * 100).toFixed(0)}%.`;

    const synthesis = await this.claude.generate(synthesisPrompt);

    return {
      id: crypto.randomUUID(),
      topic,
      analyses,
      avgConfidence,
      synthesis,
      createdAt: new Date().toISOString(),
    };
  }
}
