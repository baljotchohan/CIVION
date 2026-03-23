// Advanced Debate Engine — orchestrates 5 agents with transparent thinking
// Extends the existing DebateEngine without breaking the original

import { GeminiClient } from '@/services/gemini-api';
import { AdvancedGoalAgent } from './advanced-goal-agent';
import { AdvancedResearchAgent } from './advanced-research-agent';
import { AdvancedAnalysisAgent } from './advanced-analysis-agent';
import { AdvancedExecutionAgent } from './advanced-execution-agent';
import { AdvancedMonitoringAgent } from './advanced-monitoring-agent';
import { AdvancedAgent, AdvancedAgentResponse } from './advanced-agent';

export interface AdvancedDebateResult {
  id: string;
  topic: string;
  agentResponses: AdvancedAgentResponse[];
  consensus: string;
  disagreements: Record<string, string[]>;
  recommendations: string[];
  confidenceScore: number;
  thinkingProcess: {
    commonThemes: string[];
    conflictingPoints: string[];
    synthesis: string;
  };
  createdAt: string;
}

export class AdvancedDebateEngine {
  private agents: AdvancedAgent[];
  private gemini: GeminiClient;

  constructor(gemini: GeminiClient) {
    this.gemini = gemini;
    this.agents = [
      new AdvancedGoalAgent(gemini),
      new AdvancedResearchAgent(gemini),
      new AdvancedAnalysisAgent(gemini),
      new AdvancedExecutionAgent(gemini),
      new AdvancedMonitoringAgent(gemini),
    ];
  }

  async runDebate(
    topic: string,
    onAgentComplete?: (response: AdvancedAgentResponse) => void,
    onSynthesizing?: () => void
  ): Promise<AdvancedDebateResult> {
    // Run all 5 agents in parallel, emit progress as each finishes
    const responses = await Promise.all(
      this.agents.map(async (agent) => {
        const result = await agent.analyze(topic);
        if (onAgentComplete) onAgentComplete(result);
        return result;
      })
    );

    if (onSynthesizing) onSynthesizing();

    // Synthesize final consensus using Gemini
    const synthesisPrompt = `You are the Synthesis Engine for a 5-expert AI debate on:
"${topic}"

Here are the expert analyses:
${responses.map((r) => `### ${r.name}\n${r.response}\nKey recs: ${r.recommendations.join('; ')}`).join('\n\n---\n\n')}

Provide a FINAL SYNTHESIS with:
1. What all experts agree on
2. Key points of divergence
3. The single best recommended course of action
4. Overall confidence reasoning

Be concise and decisive. Average confidence: ${(this.avgConfidence(responses) * 100).toFixed(0)}%.`;

    const synthesis = await this.gemini.generate(synthesisPrompt);

    const disagreements = this.findDisagreements(responses);
    const recommendations = this.mergeRecommendations(responses);

    return {
      id: crypto.randomUUID(),
      topic,
      agentResponses: responses,
      consensus: synthesis,
      disagreements,
      recommendations,
      confidenceScore: this.avgConfidence(responses),
      thinkingProcess: {
        commonThemes: this.findCommonThemes(responses),
        conflictingPoints: Object.keys(disagreements),
        synthesis,
      },
      createdAt: new Date().toISOString(),
    };
  }

  private avgConfidence(responses: AdvancedAgentResponse[]): number {
    const avg = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    return parseFloat(avg.toFixed(2));
  }

  private findDisagreements(responses: AdvancedAgentResponse[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const r1 = responses[i];
        const r2 = responses[j];
        const set1 = new Set(r1.recommendations);
        const set2 = new Set(r2.recommendations);
        const diffs: string[] = [];
        set1.forEach((rec) => { if (!set2.has(rec)) diffs.push(`${r1.name}: ${rec}`); });
        set2.forEach((rec) => { if (!set1.has(rec)) diffs.push(`${r2.name}: ${rec}`); });
        if (diffs.length > 0) {
          result[`${r1.name} vs ${r2.name}`] = diffs;
        }
      }
    }
    return result;
  }

  private mergeRecommendations(responses: AdvancedAgentResponse[]): string[] {
    return [...new Set(responses.flatMap((r) => r.recommendations))];
  }

  private findCommonThemes(responses: AdvancedAgentResponse[]): string[] {
    return responses
      .map((r) => r.thinking.reasoning.slice(0, 80))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);
  }
}
