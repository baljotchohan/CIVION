"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function GuidePage() {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl mx-auto pb-10">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">CIVION Guide</h1>
                <p className="text-text-secondary text-lg">Understanding the glass-box intelligence network.</p>
            </div>

            <div className="space-y-12">
                <section>
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Badge color="blue" size="sm">1</Badge>
                        Core Concepts
                    </h2>
                    <Card>
                        <CardContent className="p-6 prose prose-invert max-w-none text-text-primary">
                            <p>CIVION is not a standard chatbot. It is a continuous intelligence loop. While you sleep, work, or play, your local instance of CIVION is reading feeds, searching the web, executing code, and analyzing data.</p>

                            <ul className="space-y-4 mt-6">
                                <li>
                                    <strong>Signals:</strong> The raw atomic units of information discovering by your agents (e.g., a tweet, a github commit, a news article).
                                </li>
                                <li>
                                    <strong>Debates:</strong> When conflicting or highly significant signals occur, agents spin up a debate room to argue validity and outcome. You can watch this in the Reasoning tab.
                                </li>
                                <li>
                                    <strong>Predictions:</strong> Synthesized, probabilistic outcomes determined by the agent network consensus.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Badge color="purple" size="sm">2</Badge>
                        Interacting with NICK
                    </h2>
                    <Card>
                        <CardContent className="p-6 text-text-primary">
                            <p className="mb-4">NICK is the face of the network. He is your gateway into the intelligence the agents have gathered.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="p-4 bg-bg-subtle rounded-xl border border-border">
                                    <h4 className="font-semibold mb-2">Passive Observation</h4>
                                    <p className="text-sm text-text-secondary">Keep the Dashboard open to watch confidence levels cascade as agents work in the background.</p>
                                </div>
                                <div className="p-4 bg-bg-subtle rounded-xl border border-border">
                                    <h4 className="font-semibold mb-2">Active Querying</h4>
                                    <p className="text-sm text-text-secondary">Click the NICK icon in the bottom right to ask questions about the data collected or give the network new objectives.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Badge color="amber" size="sm">3</Badge>
                        Data Privacy
                    </h2>
                    <Card>
                        <CardContent className="p-6 text-text-primary">
                            <p>Everything runs on your machine. The internal database, system files, and settings never leave your local environment. API keys are stored locally and only sent directly to the respective providers (OpenAI, Anthropic) during execution.</p>
                        </CardContent>
                    </Card>
                </section>
            </div>

        </div>
    );
}
