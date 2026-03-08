"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function NetworkPage() {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-5xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Swarm Network</h1>
                    <p className="text-sm text-text-secondary mt-1">Connect your CIVION instance with other users to share compute and signals securely.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-bg-card to-bg-subtle border-accent/20">
                    <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-accent/10 text-accent rounded-xl shrink-0">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">P2P Signal Sharing</h3>
                                <p className="text-text-secondary mb-4 leading-relaxed">
                                    The Swarm Network allows disparate CIVION instances to anonymously exchange high-confidence signals and predictions using end-to-end encryption. Enable to participate in the global intelligence graph.
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button variant="primary" disabled>Initialize Node (Coming Soon)</Button>
                                    <Button variant="outline">Read Whitepaper</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-dashed border-border-strong bg-transparent">
                    <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                        <svg className="w-10 h-10 text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                        <h4 className="font-semibold text-text-primary mb-1">Peer Discovery</h4>
                        <p className="text-sm text-text-secondary mb-4">You are currently operating in isolated local mode.</p>
                        <span className="inline-flex px-2py-1 text-xs font-medium bg-border rounded text-text-secondary">Offline</span>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
