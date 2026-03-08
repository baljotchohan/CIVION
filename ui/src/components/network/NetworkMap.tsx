'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield, Activity, Wifi, MapPin } from 'lucide-react';

export interface Peer {
    id: string;
    location: string;
    findings_count: number;
    status: "active" | "syncing" | "offline";
    latency: number;
}

export interface SharedSignal {
    id: string;
    from_peer: string;
    to_peer: string;
    title: string;
    timestamp: string;
}

interface NetworkMapProps {
    peers: Peer[];
    signals: SharedSignal[];
}

// Generate random but deterministic positions for nodes in a circle
const getPosition = (index: number, total: number, radius: number = 150) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
    };
};

export const NetworkMap: React.FC<NetworkMapProps> = ({ peers, signals }) => {
    const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
    const [activeSignal, setActiveSignal] = useState<SharedSignal | null>(null);

    // Map peers to their fixed positions
    const nodeMap = useMemo(() => {
        const map = new Map<string, { x: number; y: number }>();
        peers.forEach((peer, i) => {
            map.set(peer.id, getPosition(i, peers.length, 120));
        });
        return map;
    }, [peers]);

    // Simulate signal flow
    useEffect(() => {
        if (signals.length === 0) return;
        let idx = 0;
        const interval = setInterval(() => {
            setActiveSignal(signals[idx % signals.length]);
            idx++;
        }, 3000);
        return () => clearInterval(interval);
    }, [signals]);

    const totalFindings = peers.reduce((acc, p) => acc + p.findings_count, 0);

    return (
        <div className="relative w-full h-[500px] bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] rounded-xl border border-[#00d4ff]/20 shadow-[0_0_20px_rgba(0,212,255,0.1)] overflow-hidden flex flex-col">

            {/* Background Grid */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #00d4ff 1px, transparent 1px), linear-gradient(to bottom, #00d4ff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, #00d4ff 0%, transparent 60%)`
                }}
            />

            {/* Header Stats */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between z-10 pointer-events-none">
                <div>
                    <h2 className="text-xl font-bold font-sans text-white flex items-center shadow-black drop-shadow-lg">
                        <Globe className="w-5 h-5 mr-2 text-[#00d4ff]" />
                        P2P Global Network
                    </h2>
                    <div className="text-xs font-mono text-[#a0a0a0] mt-1 drop-shadow-md">
                        Decentralized intelligence sharing
                    </div>
                </div>

                <div className="flex space-x-4">
                    <div className="bg-[#1a1f3a]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#00d4ff]/30 text-center font-mono text-sm pointer-events-auto shadow-lg hover:border-[#00d4ff]/60 transition-colors">
                        <div className="text-[10px] text-[#00d4ff] uppercase tracking-wider mb-1">Active Peers</div>
                        <div className="font-bold text-white text-lg">{peers.filter(p => p.status === 'active').length} <span className="text-[#a0a0a0] text-sm font-normal">/ {peers.length}</span></div>
                    </div>
                    <div className="bg-[#1a1f3a]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#00ff88]/30 text-center font-mono text-sm pointer-events-auto shadow-lg hover:border-[#00ff88]/60 transition-colors">
                        <div className="text-[10px] text-[#00ff88] uppercase tracking-wider mb-1">Total Findings</div>
                        <div className="font-bold text-white text-lg">{totalFindings.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Interactive Map Area */}
            <div className="flex-1 relative flex items-center justify-center">
                <div className="relative w-[300px] h-[300px]">

                    {/* Central Hub */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 -mt-6 -ml-6 w-12 h-12 rounded-full border-2 border-[#00d4ff] bg-[#00d4ff]/20 shadow-[0_0_20px_rgba(0,212,255,0.4)] flex items-center justify-center z-10"
                        animate={{ boxShadow: ['0 0 20px rgba(0,212,255,0.4)', '0 0 40px rgba(0,212,255,0.6)', '0 0 20px rgba(0,212,255,0.4)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Shield className="w-6 h-6 text-[#00d4ff]" />
                    </motion.div>

                    {/* Lines (Connections) */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{ left: '50%', top: '50%' }}>
                        {peers.map(peer => {
                            const pos = nodeMap.get(peer.id);
                            if (!pos) return null;
                            const isActive = peer.status === 'active';
                            return (
                                <line
                                    key={`line-${peer.id}`}
                                    x1="0" y1="0" x2={pos.x} y2={pos.y}
                                    stroke={isActive ? '#00d4ff' : '#a0a0a0'}
                                    strokeWidth="1"
                                    strokeOpacity={isActive ? 0.3 : 0.1}
                                    strokeDasharray={peer.status === 'syncing' ? '4,4' : 'none'}
                                />
                            );
                        })}

                        {/* Animated Signal Flow Container */}
                        <AnimatePresence>
                            {activeSignal && (
                                <motion.circle
                                    key={activeSignal.id}
                                    r="3"
                                    fill="#00ff88"
                                    initial={{
                                        cx: nodeMap.get(activeSignal.from_peer)?.x || 0,
                                        cy: nodeMap.get(activeSignal.from_peer)?.y || 0,
                                        opacity: 1
                                    }}
                                    animate={{
                                        cx: nodeMap.get(activeSignal.to_peer)?.x || 0,
                                        cy: nodeMap.get(activeSignal.to_peer)?.y || 0,
                                        opacity: [1, 1, 0]
                                    }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{ filter: "drop-shadow(0 0 5px #00ff88)" }}
                                />
                            )}
                        </AnimatePresence>
                    </svg>

                    {/* Peer Nodes */}
                    {peers.map(peer => {
                        const pos = nodeMap.get(peer.id);
                        if (!pos) return null;

                        const isSelected = selectedPeer?.id === peer.id;
                        const isSyncing = peer.status === 'syncing';
                        const isActive = peer.status === 'active';

                        const color = isActive ? '#00d4ff' : (isSyncing ? '#ff006e' : '#a0a0a0');

                        return (
                            <motion.div
                                key={peer.id}
                                className="absolute w-10 h-10 -ml-5 -mt-5 cursor-pointer z-20"
                                style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)` }}
                                whileHover={{ scale: 1.2 }}
                                onClick={() => setSelectedPeer(isSelected ? null : peer)}
                            >
                                <div
                                    className={`w-full h-full rounded-full border-2 flex items-center justify-center bg-[#0a0e27] relative group ${isSelected ? 'ring-2 ring-offset-2 ring-offset-[#0a0e27]' : ''}`}
                                    style={{ borderColor: color, '--tw-ring-color': color } as any}
                                >
                                    <MapPin className="w-5 h-5 opacity-80" style={{ color }} />

                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border border-inherit pointer-events-none"
                                            animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                                        />
                                    )}

                                    {/* Hover Tooltip Placeholder */}
                                    <div className="absolute top-12 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1f3a] border border-white/10 px-3 py-2 rounded-lg text-xs font-mono pointer-events-none shadow-xl z-30">
                                        <div className="font-bold text-white">{peer.location}</div>
                                        <div className="text-[10px] text-[#00ff88]">{peer.findings_count} findings</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Peer Details Panel */}
            <AnimatePresence>
                {selectedPeer && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute bottom-6 left-6 right-6 bg-gradient-to-t from-[#1a1f3a] to-[#1a1f3a]/90 backdrop-blur-xl border border-[#00d4ff]/30 rounded-xl p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-30 flex justify-between items-center"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff]">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold font-sans text-lg">{selectedPeer.location} Node</h3>
                                <div className="flex items-center space-x-3 text-xs font-mono mt-1">
                                    <span className={selectedPeer.status === 'active' ? 'text-[#00ff88]' : 'text-[#ff006e]'}>
                                        ● {selectedPeer.status.toUpperCase()}
                                    </span>
                                    <span className="text-[#a0a0a0]">Latency: {selectedPeer.latency}ms</span>
                                    <span className="text-[#00d4ff]">{selectedPeer.findings_count} shared findings</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="text-xs font-mono font-bold px-4 py-2 rounded bg-black/30 hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelectedPeer(null); }}
                        >
                            Close
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Signal Notification Feed */}
            <AnimatePresence>
                {activeSignal && (
                    <motion.div
                        key={activeSignal.id}
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 20 }}
                        className="absolute top-6 right-6 max-w-[250px] bg-[#1a1f3a]/90 backdrop-blur-md border border-[#00ff88]/30 rounded-lg p-3 shadow-lg z-30 pointer-events-none"
                    >
                        <div className="flex items-center text-[10px] font-mono text-[#00ff88] uppercase tracking-wider mb-1">
                            <Wifi className="w-3 h-3 mr-1 animate-pulse" /> Signal Received
                        </div>
                        <p className="text-xs font-sans text-white line-clamp-2">
                            {activeSignal.title}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
