import { create } from "zustand";
import { GeminiClient } from "@/services/gemini-api";
import { PersonalAgent } from "@/agents/personal-agent";
import { DebateEngine } from "@/agents/debate-engine";
import { storage, ConversationMessage } from "@/services/storage";
import { UserProfile, DebateResult, AgentResponse } from "@/agents/types";
import { apiClient } from '@/services/api';

export interface Agent {
  id: number;
  name: string;
  agent_type: string;
  status: 'active' | 'inactive';
  personality: any;
  performance_score: number;
  total_tasks_completed: number;
  success_rate: number;
}

interface AgentState {
  // --- Old Phase 1 State ---
  gemini: GeminiClient | null;
  personalAgent: PersonalAgent | null;

  conversation: ConversationMessage[];
  isThinking: boolean;

  debates: DebateResult[];
  isDebating: boolean;
  currentDebate: DebateResult | null;
  liveDebateAnalyses: AgentResponse[];
  liveDebateSynthesizing: boolean;

  initAgents: (apiKey: string, profile: UserProfile) => void;
  sendMessage: (message: string) => Promise<void>;
  startDebate: (topic: string) => Promise<DebateResult | null>;
  loadHistory: () => void;
  clearConversation: () => void;

  // --- New Phase 2 State ---
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  error: string | null;

  fetchAgents: (teamId: number) => Promise<void>;
  selectAgent: (agent: Agent) => void;
  createAgent: (data: any) => Promise<Agent>;
  updateAgent: (id: number, data: any) => Promise<void>;
  deleteAgent: (id: number) => Promise<void>;
  toggleAgentStatus: (id: number, currentStatus: string) => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Phase 1 Initial State
  gemini: null,
  personalAgent: null,
  conversation: [],
  isThinking: false,
  debates: [],
  isDebating: false,
  currentDebate: null,
  liveDebateAnalyses: [],
  liveDebateSynthesizing: false,

  // Phase 2 Initial State
  agents: [],
  selectedAgent: null,
  loading: false,
  error: null,

  // Phase 1 Actions
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
      debates: savedDebates.map((d: any) => ({
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
      // Use any for storage if Types mismatch
      (storage as any).saveConversationHistory(withResponse);
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
        (response: any) => set((state) => ({ liveDebateAnalyses: [...state.liveDebateAnalyses, response] })),
        () => set({ liveDebateSynthesizing: true })
      );

      set((state) => ({
        debates: [result, ...state.debates],
        currentDebate: result,
      }));

      // Save to storage
      (storage as any).saveDebate({
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
    // @ts-ignore
    storage.saveConversationHistory([]);
  },

  // Phase 2 Actions
  fetchAgents: async (teamId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.agents.list(teamId);
      set({ agents: res.data.agents || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  selectAgent: (agent: Agent) => set({ selectedAgent: agent }),

  createAgent: async (data: any) => {
    set({ loading: true });
    try {
      const res = await apiClient.agents.create(data);
      const newAgent = res.data.agent;
      set((state) => ({
        agents: [...state.agents, newAgent],
        selectedAgent: newAgent,
      }));
      return newAgent;
    } finally {
      set({ loading: false });
    }
  },

  updateAgent: async (id: number, data: any) => {
    try {
      await apiClient.agents.update(id, data);
      set((state) => ({
        agents: state.agents.map((a) => (a.id === id ? { ...a, ...data } : a)),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteAgent: async (id: number) => {
    try {
      await apiClient.agents.delete(id);
      set((state) => ({
        agents: state.agents.filter((a) => a.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  toggleAgentStatus: async (id: number, currentStatus: string) => {
    try {
      const action = currentStatus === 'active' ? 'deactivate' : 'activate';
      if (action === 'activate') {
        await apiClient.agents.activate(id);
      } else {
        await apiClient.agents.deactivate(id);
      }

      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === id
            ? { ...a, status: action === 'activate' ? 'active' : 'inactive' }
            : a
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
