// localStorage manager for CIVION V1
// All user data persists in the browser — no backend needed

export interface UserProfile {
  name: string;
  business: string;
  occupation: string;
  industry: string;
  goals: string[];
  useCase: string;
}

export interface SavedGoal {
  id: string;
  text: string;
  analysis: string | null;
  createdAt: string;
}

export interface SavedDebate {
  id: string;
  topic: string;
  synthesis: string;
  avgConfidence: number;
  createdAt: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface StorageData {
  userProfile: UserProfile | null;
  claudeApiKey: string | null; // Base64 encoded
  conversationHistory: ConversationMessage[];
  savedGoals: SavedGoal[];
  debates: SavedDebate[];
  onboarded: boolean;
}

const STORAGE_KEY =
  (typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_STORAGE_KEY) ||
  "civion_v1_data";

class StorageManager {
  // ── Read ─────────────────────────────────────────────
  getData(): Partial<StorageData> {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  // ── User Profile ─────────────────────────────────────
  getUserProfile(): UserProfile | null {
    return this.getData().userProfile ?? null;
  }

  saveUserProfile(profile: UserProfile): void {
    const data = this.getData();
    data.userProfile = profile;
    this.persist(data);
  }

  // ── API Key (Base64 "encrypted") ─────────────────────
  saveApiKey(key: string): void {
    const data = this.getData();
    data.claudeApiKey = btoa(key);
    this.persist(data);
  }

  getApiKey(): string | null {
    const encoded = this.getData().claudeApiKey;
    if (!encoded) return null;
    try {
      return atob(encoded);
    } catch {
      return null;
    }
  }

  // ── Onboarded flag ───────────────────────────────────
  isOnboarded(): boolean {
    return this.getData().onboarded === true;
  }

  setOnboarded(value: boolean): void {
    const data = this.getData();
    data.onboarded = value;
    this.persist(data);
  }

  // ── Conversation History ─────────────────────────────
  getConversationHistory(): ConversationMessage[] {
    return this.getData().conversationHistory ?? [];
  }

  saveConversationHistory(messages: ConversationMessage[]): void {
    const data = this.getData();
    data.conversationHistory = messages;
    this.persist(data);
  }

  // ── Goals ────────────────────────────────────────────
  getGoals(): SavedGoal[] {
    return this.getData().savedGoals ?? [];
  }

  saveGoal(goal: SavedGoal): void {
    const data = this.getData();
    data.savedGoals = [...(data.savedGoals ?? []), goal];
    this.persist(data);
  }

  deleteGoal(id: string): void {
    const data = this.getData();
    data.savedGoals = (data.savedGoals ?? []).filter((g) => g.id !== id);
    this.persist(data);
  }

  // ── Debates ──────────────────────────────────────────
  getDebates(): SavedDebate[] {
    return this.getData().debates ?? [];
  }

  saveDebate(debate: SavedDebate): void {
    const data = this.getData();
    data.debates = [...(data.debates ?? []), debate];
    this.persist(data);
  }

  // ── Clear ────────────────────────────────────────────
  clearAll(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // ── Private ──────────────────────────────────────────
  private persist(data: Partial<StorageData>): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("StorageManager: failed to persist", e);
    }
  }
}

export const storage = new StorageManager();
