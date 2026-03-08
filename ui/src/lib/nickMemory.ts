export interface NickMemory {
    user_name: string;
    facts: string[];
    preferences: string[];
    conversation_count: number;
    topics_of_interest: string[];
    last_conversation: string;
    notable_events: string[];
}

export async function getNickMemory(): Promise<NickMemory | null> {
    try {
        const res = await fetch('/api/v1/nick/memory');
        if (!res.ok) throw new Error('Failed to fetch memory');
        return res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function teachNick(fact: string): Promise<boolean> {
    try {
        const res = await fetch('/api/v1/nick/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fact })
        });
        return res.ok;
    } catch (err) {
        console.error(err);
        return false;
    }
}
