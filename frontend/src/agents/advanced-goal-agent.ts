// Advanced Goal Agent — strategic planning & milestone definition

import { GeminiClient } from '@/services/gemini-api';
import { AdvancedAgent } from './advanced-agent';

export class AdvancedGoalAgent extends AdvancedAgent {
  protected name = '🎯 Goal Agent';
  protected type = 'goal-setting';
  protected personality = 'Strategic, visionary, outcomes-focused, decisive';
  protected expertise =
    'Goal setting, OKRs, strategic planning, milestone definition, success metrics, feasibility analysis';

  constructor(gemini: GeminiClient) {
    super(gemini);
  }
}
