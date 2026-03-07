'use client';
import React from 'react';
import { motion } from 'framer-motion';

const mockPeers = [
    { id: 'peer_01', name: 'Node-Alpha', url: '10.0.1.15:8000', status: 'connected', signals_shared: 23, last_seen: '1 min ago' },
    { id: 'peer_02', name: 'Node-Beta', url: '10.0.2.28:8000', status: 'connected', signals_shared: 18, last_seen: '3 min ago' },
    { id: 'peer_03', name: 'Node-Gamma', url: '10.0.3.42:8000', status: 'syncing', signals_shared: 12, last_seen: 'now' },
    { id: 'peer_04', name: 'Node-Delta', url: '192.168.1.50:8000', status: 'disconnected', signals_shared: 7, last_seen: '15 min ago' },
];

const networkStats = { peers: 12, signals_shared: 34, consensus: '67%', health: 'Excellent', uptime: '99.2%' };

export default function NetworkPage() {
    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="page-title">🌐 Intelligence Network</h2>
                    <p className="page-subtitle">P2P distributed intelligence sharing</p>
                </div>
                <button className="btn-primary">+ Join Network</button>
            </header>

            {/* Network Stats */}
            <div className="grid grid-cols-5 gap-4">
                {[
                    { label: 'Peers', value: networkStats.peers, color: 'text-info', icon: '👥' },
                    { label: 'Shared Signals', value: networkStats.signals_shared, color: 'text-success', icon: '📡' },
                    { label: 'Consensus', value: networkStats.consensus, color: 'text-warning', icon: '🤝' },
                    { label: 'Health', value: networkStats.health, color: 'text-success', icon: '💚' },
                    { label: 'Uptime', value: networkStats.uptime, color: 'text-accent-primary', icon: '⬆' },
                ].map(stat => (
                    <div key={stat.label} className="sci-fi-card p-4 text-center">
                        <span className="text-xl">{stat.icon}</span>
                        <p className={`text-xl font-bold font-mono mt-1 ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-text-tertiary">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Peer List */}
            <div className="sci-fi-card">
                <div className="p-4 border-b border-border-color">
                    <h3 className="font-mono text-sm text-accent-primary">CONNECTED PEERS</h3>
                </div>
                <div className="divide-y divide-border-color">
                    {mockPeers.map((peer, i) => (
                        <motion.div key={peer.id} className="p-4 flex justify-between items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                            <div className="flex items-center space-x-3">
                                <span className={`status-pulse ${peer.status === 'connected' ? '' : peer.status === 'syncing' ? 'bg-warning' : 'bg-error'}`}></span>
                                <div>
                                    <p className="font-semibold text-sm">{peer.name}</p>
                                    <p className="text-xs text-text-tertiary font-mono">{peer.url}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-xs text-text-secondary">{peer.signals_shared} signals</span>
                                <span className={`badge ${peer.status === 'connected' ? 'badge-green' : peer.status === 'syncing' ? 'badge-yellow' : 'badge-red'}`}>{peer.status}</span>
                                <span className="text-[10px] text-text-tertiary">{peer.last_seen}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Network Visualization Placeholder */}
            <div className="sci-fi-card p-6 text-center">
                <h3 className="font-mono text-sm text-accent-secondary mb-4">NETWORK TOPOLOGY</h3>
                <div className="h-48 flex items-center justify-center text-text-tertiary">
                    <div className="relative">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="absolute w-3 h-3 rounded-full bg-accent-primary/50 animate-pulse" style={{
                                top: `${50 + 40 * Math.sin(i * Math.PI / 3)}%`,
                                left: `${50 + 40 * Math.cos(i * Math.PI / 3)}%`,
                                animationDelay: `${i * 0.3}s`,
                            }} />
                        ))}
                        <div className="w-4 h-4 rounded-full bg-accent-primary neon-text" />
                    </div>
                </div>
            </div>
        </div>
    );
}
