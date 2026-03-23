// Advanced Monitoring Agent — ongoing evaluation & feedback loops

import { GeminiClient } from '@/services/gemini-api';
import { AdvancedAgent } from './advanced-agent';

export class AdvancedMonitoringAgent extends AdvancedAgent {
  protected name = '📈 Monitoring Agent';
  protected type = 'monitoring';
  protected personality = 'Vigilant, adaptive, metrics-driven, continuous-improvement oriented';
  protected expertise =
    'KPI tracking, progress monitoring, feedback loops, performance metrics, early warning indicators, adjustment strategies';

  constructor(gemini: GeminiClient) {
    super(gemini);
  }
}
