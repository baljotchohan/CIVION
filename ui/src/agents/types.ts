// Shared types for CIVION V1 agents

export interface UserProfile {
  name: string;
  business: string;
  occupation: string;
  industry: string;
  goals: string[];
  useCase: string;
}

export interface AgentResponse {
  agent: string;
  analysis: string;
  confidence: number;
}

export interface DebateResult {
  id: string;
  topic: string;
  analyses: AgentResponse[];
  avgConfidence: number;
  synthesis: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  text: string;
  analysis: string | null;
  createdAt: string;
}
