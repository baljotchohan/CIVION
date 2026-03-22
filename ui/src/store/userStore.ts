// Zustand store for user profile and onboarding state

import { create } from "zustand";
import { storage, UserProfile } from "@/services/storage";

interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  hasApiKey: boolean;

  // Actions
  loadFromStorage: () => void;
  setProfile: (profile: UserProfile) => void;
  setApiKey: (key: string) => void;
  getApiKey: () => string | null;
  clearAll: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isOnboarded: false,
  hasApiKey: false,

  loadFromStorage: () => {
    const profile = storage.getUserProfile();
    const apiKey = storage.getApiKey();
    const onboarded = storage.isOnboarded();
    set({
      profile,
      isOnboarded: onboarded,
      hasApiKey: !!apiKey,
    });
  },

  setProfile: (profile: UserProfile) => {
    storage.saveUserProfile(profile);
    set({ profile });
  },

  setApiKey: (key: string) => {
    storage.saveApiKey(key);
    set({ hasApiKey: true });
  },

  getApiKey: () => {
    return storage.getApiKey();
  },

  clearAll: () => {
    storage.clearAll();
    set({
      profile: null,
      isOnboarded: false,
      hasApiKey: false,
    });
  },
}));
