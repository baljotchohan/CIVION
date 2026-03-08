export interface VaultEntry {
    id: string;
    type: 'signal' | 'prediction' | 'debate' | 'insight' | 'file';
    title: string;
    content: any;
    source: string;
    agent: string;
    timestamp: string;
    tags: string[];
    saved: boolean;
    file_path?: string;
}

export interface VaultResponse {
    items: VaultEntry[];
    total: number;
    limit: number;
    offset: number;
}

export async function getVaultItems(type?: string, limit = 50, offset = 0): Promise<VaultResponse> {
    try {
        const url = new URL('/api/v1/vault', window.location.origin);
        if (type) url.searchParams.append('type', type);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('offset', offset.toString());

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
    } catch (err) {
        console.error(err);
        return { items: [], total: 0, limit, offset };
    }
}

export async function deleteVaultItem(id: string): Promise<boolean> {
    try {
        const res = await fetch(`/api/v1/vault/${id}`, { method: 'DELETE' });
        return res.ok;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export function exportVaultUrl(): string {
    return '/api/v1/vault/export';
}
