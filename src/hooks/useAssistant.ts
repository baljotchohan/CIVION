// Re-export agent store for assistant functionality
import { useAgentStore } from "@/store/agentStore";

export const useAssistant = () => {
  const { conversation: messages, sendMessage, isThinking } = useAgentStore();
  return { messages, sendMessage, isThinking };
};
