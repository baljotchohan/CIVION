// Advanced Research Agent — deep information gathering & synthesis

import { GeminiClient } from '@/services/gemini-api';
import { AdvancedAgent } from './advanced-agent';

export class AdvancedResearchAgent extends AdvancedAgent {
  protected name = '🔍 Research Agent';
  protected type = 'research';
  protected personality = 'Curious, methodical, evidence-driven, thorough';
  protected expertise =
    'Information gathering, market research, competitive analysis, fact verification, trend identification';

  constructor(gemini: GeminiClient) {
    super(gemini);
  }
}
