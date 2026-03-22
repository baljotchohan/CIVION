// Personal Agent — the user's primary assistant in CIVION

import { GeminiClient } from "@/services/gemini-api";
import { UserProfile } from "./types";

export class PersonalAgent {
  private gemini: GeminiClient;
  private userProfile: UserProfile;

  constructor(gemini: GeminiClient, userProfile: UserProfile) {
    this.gemini = gemini;
    this.userProfile = userProfile;
  }

  private get systemPrompt(): string {
    return `You are the Personal Assistant for ${this.userProfile.name} from ${this.userProfile.business}.

Their role: ${this.userProfile.occupation}
Their industry: ${this.userProfile.industry}
Their goals: ${this.userProfile.goals.join(", ")}

Always be:
- Warm, professional, and personalized
- Reference their business and goals when relevant
- Actionable and specific in your advice
- Concise but thorough

You are part of CIVION, a personal AI intelligence network. You coordinate with specialized agents (Goal, Research, Analysis, Execution, Monitoring) to help users achieve their objectives.`;
  }

  async greetUser(): Promise<string> {
    const prompt = `Write a warm, personalized greeting for ${this.userProfile.name}.

Their profile:
- Business: ${this.userProfile.business}
- Role: ${this.userProfile.occupation}
- Industry: ${this.userProfile.industry}
- Goals: ${this.userProfile.goals.join(", ")}

The greeting should:
1. Address them by name
2. Reference their business or industry
3. Show you understand their goals
4. Briefly mention the CIVION agent team is ready

Keep it under 80 words. Be warm but not overly effusive.`;

    return await this.gemini.generate(prompt, this.systemPrompt);
  }

  async respondToUser(message: string): Promise<string> {
    return await this.gemini.generate(message, this.systemPrompt);
  }

  async streamResponse(
    message: string,
    onToken: (token: string) => void
  ): Promise<string> {
    return await this.gemini.generateStream(
      message,
      this.systemPrompt,
      onToken
    );
  }
}
