'use client';

import React from 'react';
import { NetworkMap, Peer, SharedSignal } from '@/components/network/NetworkMap';
import { Globe, Shield, Activity, Share2, Wifi } from 'lucide-react';

const mockPeers: Peer[] = [
    { id: '1', location: 'US-East', findings_count: 145, status: 'active', latency: 45 },
    { id: '2', location: 'EU-Central', findings_count: 89, status: 'active', latency: 110 },
    { id: '3', location: 'AP-South', findings_count: 234, status: 'active', latency: 180 },
    { id: '4', location: 'US-West', findings_count: 56, status: 'syncing', latency: 60 },
    { id: '5', location: 'SA-East', findings_count: 12, status: 'offline', latency: 0 },
];

const mockSharedSignals: SharedSignal[] = [
    { id: 's1', from_peer: '3', to_peer: '1', title: 'New autonomous routing exploit pattern detected', timestamp: new Date(Date.now() - 30000).toISOString() },
    { id: 's2', from_peer: '2', to_peer: '4', title: 'ArXiv paper: Scaling laws breakdown at 100T parameters', timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 's3', from_peer: '1', to_peer: '2', title: 'GitHub trend: Rust-based AI agent frameworks +300%', timestamp: new Date(Date.now() - 120000).toISOString() },
    { id: 's4', from_peer: '4', to_peer: '3', title: 'Sentiment shift: Developer fatigue with RAG pipelines', timestamp: new Date(Date.now() - 300000).toISOString() },
];

export default function NetworkPage() {
    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 ml-[240px] flex flex-col h-screen overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                        <Globe className="w-5 h-5 text-[#00d4ff]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-sans tracking-tight text-white">Global P2P Network</h1>
                        <p className="text-xs font-mono text-[#a0a0a0]">Decentralized intelligence sharing across nodes</p>
                    </div>
                </div>

                <button className="flex items-center px-6 py-2 rounded-lg bg-[#00d4ff] text-[#0a0e27] font-black font-sans text-sm hover:bg-[#33ddff] transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-105 active:scale-95">
                    <Wifi className="w-4 h-4 mr-2" /> Broadcast Node Presence
                </button>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">

                {/* Main Network Map Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 rounded-xl overflow-hidden border border-[#00d4ff]/20 bg-[#1a1f3a]/50 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                        <NetworkMap peers={mockPeers} signals={mockSharedSignals} />
                    </div>

                    {/* Bottom Shared Signals Feed */}
                    <div className="mt-6 h-64 bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-4 flex flex-col">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-[#a0a0a0] mb-4 flex items-center">
                            <Share2 className="w-4 h-4 mr-2 text-[#00d4ff]" /> Live Node Exchange Feed
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {mockSharedSignals.map((sig, i) => (
                                <div key={i} className="bg-black/20 rounded-lg p-3 border border-white/5 flex items-center hover:border-[#00d4ff]/30 transition-colors">
                                    <div className="flex flex-col items-center justify-center px-3 border-r border-white/10 mr-4">
                                        <span className="text-[10px] font-mono text-[#a0a0a0]">FROM</span>
                                        <span className="text-xs font-bold text-[#00d4ff]">{mockPeers.find(p => p.id === sig.from_peer)?.location || 'Unknown'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-sans text-white line-clamp-1">{sig.title}</p>
                                        <span className="text-[10px] font-mono text-gray-500">{new Date(sig.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center px-3 border-l border-white/10 ml-4">
                                        <span className="text-[10px] font-mono text-[#a0a0a0]">TO</span>
                                        <span className="text-xs font-bold text-[#00ff88]">{mockPeers.find(p => p.id === sig.to_peer)?.location || 'Unknown'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Peer List */}
                <div className="w-80 flex flex-col bg-[#1a1f3a]/80 backdrop-blur rounded-xl border border-white/5 p-4 flex-shrink-0">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#a0a0a0] mb-4 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-[#00ff88]" /> Verified Nodes
                    </h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {mockPeers.map(peer => {
                            const statusColors = {
                                active: '#00d4ff',
                                syncing: '#ff006e',
                                offline: '#a0a0a0'
                            };
                            const color = statusColors[peer.status];

                            return (
                                <div key={peer.id} className="bg-black/30 p-3 rounded-xl border border-white/5 relative group cursor-pointer hover:border-white/20 transition-all">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: color }} />

                                    <div className="pl-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold font-sans text-white text-sm">{peer.location}</div>
                                            <div className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border" style={{ color, borderColor: `${color}30`, backgroundColor: `${color}10` }}>
                                                {peer.status}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
                                            <div>
                                                <div className="text-[9px] font-mono text-[#a0a0a0] uppercase mb-0.5">Findings</div>
                                                <div className="text-xs font-mono font-bold text-white">{peer.findings_count}</div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-mono text-[#a0a0a0] uppercase mb-0.5">Latency</div>
                                                <div className="text-xs font-mono font-bold" style={{ color: peer.latency > 150 ? '#ff006e' : '#00ff88' }}>
                                                    {peer.latency > 0 ? `${peer.latency}ms` : '---'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
