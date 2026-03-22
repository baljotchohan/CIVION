// Zustand store for agent interactions: chat and debates

import { create } from "zustand";
import { GeminiClient } from "@/services/gemini-api";
import { PersonalAgent } from "@/agents/personal-agent";
import { DebateEngine } from "@/agents/debate-engine";
import { storage, ConversationMessage } from "@/services/storage";
import { UserProfile, DebateResult, AgentResponse } from "@/agents/types";

interface AgentState {
  // Claude client
  gemini: GeminiClient | null;
  personalAgent: PersonalAgent | null;

  // Chat
  conversation: ConversationMessage[];
  isThinking: boolean;

  // Debates
  debates: DebateResult[];
  isDebating: boolean;
  currentDebate: DebateResult | null;
  liveDebateAnalyses: AgentResponse[];
  liveDebateSynthesizing: boolean;

  // Actions
  initAgents: (apiKey: string, profile: UserProfile) => void;
  sendMessage: (message: string) => Promise<void>;
  startDebate: (topic: string) => Promise<DebateResult | null>;
  loadHistory: () => void;
  clearConversation: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  gemini: null,
  personalAgent: null,
  conversation: [],
  isThinking: false,
  debates: [],
  isDebating: false,
  currentDebate: null,
  liveDebateAnalyses: [],
  liveDebateSynthesizing: false,

  initAgents: (apiKey: string, profile: UserProfile) => {
    const gemini = new GeminiClient(apiKey);
    const personalAgent = new PersonalAgent(gemini, profile);
    set({ gemini, personalAgent });
  },

  loadHistory: () => {
    const history = storage.getConversationHistory();
    const savedDebates = storage.getDebates();
    set({
      conversation: history,
      debates: savedDebates.map((d) => ({
        id: d.id,
        topic: d.topic,
        analyses: [],
        avgConfidence: d.avgConfidence,
        synthesis: d.synthesis,
        createdAt: d.createdAt,
      })),
    });
  },

  sendMessage: async (message: string) => {
    const { personalAgent, conversation } = get();
    if (!personalAgent) return;

    const userMsg: ConversationMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    const updated = [...conversation, userMsg];
    set({ conversation: updated, isThinking: true });

    try {
      const response = await personalAgent.respondToUser(message);
      const assistantMsg: ConversationMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      const withResponse = [...updated, assistantMsg];
      set({ conversation: withResponse });
      storage.saveConversationHistory(withResponse);
    } catch (error) {
      const errorMsg: ConversationMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your API key and try again.",
        timestamp: new Date().toISOString(),
      };
      const withError = [...updated, errorMsg];
      set({ conversation: withError });
    } finally {
      set({ isThinking: false });
    }
  },

  startDebate: async (topic: string) => {
    const { gemini } = get();
    if (!gemini) return null;

    set({ isDebating: true, currentDebate: null, liveDebateAnalyses: [], liveDebateSynthesizing: false });

    try {
      const engine = new DebateEngine(gemini);
      const result = await engine.runDebate(
        topic,
        (response) => set((state) => ({ liveDebateAnalyses: [...state.liveDebateAnalyses, response] })),
        () => set({ liveDebateSynthesizing: true })
      );

      set((state) => ({
        debates: [result, ...state.debates],
        currentDebate: result,
      }));

      // Save to storage
      storage.saveDebate({
        id: result.id,
        topic: result.topic,
        synthesis: result.synthesis,
        avgConfidence: result.avgConfidence,
        createdAt: result.createdAt,
      });

      return result;
    } catch (error) {
      console.error("Debate failed:", error);
      return null;
    } finally {
      set({ isDebating: false });
    }
  },

  clearConversation: () => {
    set({ conversation: [] });
    storage.saveConversationHistory([]);
  },
}));
