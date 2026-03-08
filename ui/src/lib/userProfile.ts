export interface UserProfile {
    id?: string;
    name: string;
    occupation: string;
    interests: string[];
    goals: string[];
    experience_level: 'beginner' | 'intermediate' | 'expert';
    onboarding_complete: boolean;
    created_at: string;
    last_active: string;
    preferences: {
        theme: 'light' | 'dark' | 'system';
        notifications: boolean;
        auto_start_agents: boolean;
        default_llm: string;
    };
}

export async function getUserProfile(): Promise<UserProfile | null> {
    try {
        const res = await fetch('/api/v1/nick/profile');
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch profile');
        }
        return res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function saveUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
        const res = await fetch('/api/v1/nick/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        return res.ok;
    } catch (err) {
        console.error(err);
        return false;
    }
}
