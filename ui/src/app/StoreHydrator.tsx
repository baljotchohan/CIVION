"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useAgentStore } from "@/store/agentStore";
import { storage } from "@/services/storage";

/**
 * Hydrates Zustand stores from localStorage on mount.
 * Renders nothing — just runs the hydration logic once.
 */
export function StoreHydrator() {
  const loadFromStorage = useUserStore((s) => s.loadFromStorage);
  const { initAgents, loadHistory } = useAgentStore();
  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Initialize agents after profile loads
  useEffect(() => {
    const apiKey = storage.getApiKey();
    const userProfile = storage.getUserProfile();
    if (apiKey && userProfile) {
      initAgents(apiKey, userProfile);
      loadHistory();
    }
  }, [profile, initAgents, loadHistory]);

  return null;
}
