"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getVaultItems, deleteVaultItem, VaultEntry } from '@/lib/dataVault';
import { useToast } from '@/components/ui/Toast';

export default function VaultPage() {
    const [items, setItems] = useState<VaultEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const loadVault = async () => {
        setLoading(true);
        const res = await getVaultItems();
        setItems(res.items);
        setLoading(false);
    };

    useEffect(() => {
        // Polling vault manually for pure frontend since no socket hook yet 
        loadVault();
    }, []);

    const handleDelete = async (id: string) => {
        const success = await deleteVaultItem(id);
        if (success) {
            addToast('success', 'Item deleted');
            setItems(items.filter(i => i.id !== id));
        } else {
            addToast('error', 'Failed to delete item');
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'file': return <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            case 'signal': return <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
            case 'prediction': return <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
            default: return <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-5xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Data Vault</h1>
                    <p className="text-sm text-text-secondary mt-1">Saved files, important signals, and generated reports.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" href="/api/v1/vault/export" as="a" target="_blank">
                        Export JSON
                    </Button>
                    <Button variant="primary">
                        Upload File
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col gap-4">
                    <div className="h-24 bg-bg-card animate-pulse rounded-xl border border-border" />
                    <div className="h-24 bg-bg-card animate-pulse rounded-xl border border-border" />
                </div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="Vault is Empty"
                    description="You haven't saved any items to the Data Vault yet. NICK and agents will automatically store synthesized reports here."
                    className="mt-12"
                />
            ) : (
                <div className="space-y-4">
                    {items.map(item => (
                        <Card key={item.id} hoverable>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-border flex items-center justify-center shrink-0">
                                        {getIconForType(item.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary truncate">{item.title}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Badge size="sm" color="grey">{item.type}</Badge>
                                            <span className="text-xs text-text-muted">{new Date(item.timestamp).toLocaleString()}</span>
                                            {item.source && <span className="text-xs text-text-muted border-l border-border pl-2">{item.source}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10"
                                        title="Delete"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

        </div>
    );
}
