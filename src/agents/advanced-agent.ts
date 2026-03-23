// Advanced Agent Base Class — transparent thinking & memory for CIVION V1.2

import { GeminiClient } from '@/services/gemini-api';

export interface AgentThinking {
  steps: string[];
  reasoning: string;
  confidence: number;
  sources?: string[];
}

export interface AdvancedAgentResponse {
  name: string;
  type: string;
  response: string;
  thinking: AgentThinking;
  confidence: number;
  recommendations: string[];
  nextActions?: string[];
}

export abstract class AdvancedAgent {
  protected abstract name: string;
  protected abstract type: string;
  protected abstract personality: string;
  protected abstract expertise: string;
  protected memory: string[] = [];
  protected gemini: GeminiClient;

  constructor(gemini: GeminiClient) {
    this.gemini = gemini;
  }

  protected buildSystemPrompt(): string {
    return `You are ${this.name}, a specialized AI agent.
ROLE: ${this.type}
PERSONALITY: ${this.personality}
EXPERTISE: ${this.expertise}

RESPONSE RULES:
1. Think step-by-step. Show your reasoning.
2. Rate your confidence from 0.0 to 1.0.
3. Provide at least 2 actionable recommendations.
4. Be concise but thorough.

IMPORTANT — You MUST respond with ONLY valid JSON in this exact shape:
{
  "thinking": {
    "steps": ["step 1", "step 2", "step 3"],
    "reasoning": "one paragraph overall reasoning",
    "confidence": 0.85
  },
  "response": "your full analysis here",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "nextActions": ["action 1", "action 2"]
}

Do NOT include any text before or after the JSON block.`;
  }

  async analyze(topic: string, context?: string): Promise<AdvancedAgentResponse> {
    const memoryContext = this.memory.length > 0
      ? `\n\nPrevious learnings:\n${this.memory.slice(-5).join('\n')}`
      : '';

    const prompt = [
      context ? `Context: ${context}` : '',
      `Topic/Question: ${topic}`,
      memoryContext,
    ]
      .filter(Boolean)
      .join('\n\n');

    const rawText = await this.gemini.generate(prompt, this.buildSystemPrompt());

    // Extract JSON from the response (model may add markdown fences)
    let parsed: Partial<{
      thinking: AgentThinking;
      response: string;
      recommendations: string[];
      nextActions: string[];
    }> = {};

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, wrap raw text in a minimal structure
      parsed = {
        thinking: { steps: [], reasoning: rawText.slice(0, 200), confidence: 0.5 },
        response: rawText,
        recommendations: [],
      };
    }

    const agentResponse: AdvancedAgentResponse = {
      name: this.name,
      type: this.type,
      response: parsed.response || rawText,
      thinking: parsed.thinking || { steps: [], reasoning: '', confidence: 0.5 },
      confidence: parsed.thinking?.confidence ?? 0.5,
      recommendations: parsed.recommendations || [],
      nextActions: parsed.nextActions,
    };

    // Store memory
    this.addMemory(`[${topic.slice(0, 60)}] → confidence ${agentResponse.confidence}`);

    return agentResponse;
  }

  protected addMemory(insight: string): void {
    this.memory.push(insight);
    if (this.memory.length > 20) {
      this.memory = this.memory.slice(-20);
    }
  }

  getMemory(): string[] {
    return this.memory;
  }
}
