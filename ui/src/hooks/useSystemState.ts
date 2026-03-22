// Lightweight system state hook for V1 (no backend)
// Provides a compatibility layer for components that still reference useSystemState

import { useUserStore } from "@/store/userStore";
import { useAgentStore } from "@/store/agentStore";

export const useSystemState = () => {
  const { isOnboarded, hasApiKey, profile } = useUserStore();
  const { debates } = useAgentStore();

  return {
    health: hasApiKey ? ("alive" as const) : ("dead" as const),
    activeAgents: [] as { id: string; name: string; status: string }[],
    signalCount: 0,
    confidenceAvg: 0,
    confidenceHistory: [],
    signals: [],
    activeDebates: debates.map((d) => ({
      id: d.id,
      topic: d.topic,
      status: "completed" as const,
      messages: [],
      conclusion: d.synthesis,
      final_confidence: d.avgConfidence,
    })),
    startAgent: () => {},
    stopAgent: () => {},
    restartAgent: () => {},
    refreshState: () => {},
    error: null,
    isLoading: false,
    needsOnboarding: !isOnboarded,
    showWakeAnimation: false,
    systemState: {
      health: hasApiKey ? ("alive" as const) : ("dead" as const),
      apiKeys: {},
      backendOnline: true,
      wsConnected: false,
      agentsRunning: 0,
      agentsTotal: 5,
      signalsToday: 0,
      confidenceAvg: 0,
      lastChecked: new Date().toISOString(),
    },
    setSystemState: () => {},
  };
};
