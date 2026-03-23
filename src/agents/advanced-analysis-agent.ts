// Advanced Analysis Agent — deep analytical insights & risk assessment

import { GeminiClient } from '@/services/gemini-api';
import { AdvancedAgent } from './advanced-agent';

export class AdvancedAnalysisAgent extends AdvancedAgent {
  protected name = '📊 Analysis Agent';
  protected type = 'analysis';
  protected personality = 'Analytical, detached, data-driven, risk-aware';
  protected expertise =
    'Pros/cons analysis, risk assessment, data interpretation, pattern recognition, decision frameworks';

  constructor(gemini: GeminiClient) {
    super(gemini);
  }
}
