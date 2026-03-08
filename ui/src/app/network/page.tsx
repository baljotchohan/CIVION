'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSystemState } from '../../hooks/useSystemState';
import { useAliveState } from '../../hooks/useAliveState';
import { getNetwork, joinNetwork } from '../../lib/api';
import { Peer, SharedSignal } from '../../types';
import { NeonButton } from '../../components/ui/NeonButton';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { DemoModeBanner } from '../../components/ui/DemoModeBanner';
import { classNames, formatRelativeTime } from '../../lib/utils';
import { Globe, Radio, Signal, Users, Shield, Zap } from 'lucide-react';

export default function NetworkPage() {
    const { subscribe } = useWebSocket();
    const { systemState } = useSystemState();
    const { dataMode } = useAliveState();
    const [peers, setPeers] = useState<Peer[]>([]);
    const [sharedSignals, setSharedSignals] = useState<SharedSignal[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [activePulses, setActivePulses] = useState<{ id: string, lat: number, lng: number }[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            if (dataMode === 'empty') return;
            try {
                const data = await getNetwork();
                setPeers(data.peers);
                setStats(data.status);
            } catch (err) {
                console.error("Failed to load network data");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [dataMode]);

    useEffect(() => {
        if (dataMode === 'empty') return;

        const handleNewSignal = (data: any) => {
            const newSig: SharedSignal = {
                id: `ss-${Date.now()}`,
                from_peer: data.from_peer || 'Unknown',
                to_peer: 'local',
                signal_id: data.signal_id || 'signal',
                timestamp: new Date().toISOString()
            };
            setSharedSignals(prev => [newSig, ...prev].slice(0, 50));

            const peer = peers.find(p => p.id === data.peer_id || p.name === data.from_peer);
            if (peer) {
                const pulseId = `pulse-${Date.now()}`;
                setActivePulses(prev => [...prev, { id: pulseId, lat: peer.lat, lng: peer.lng }]);
                setTimeout(() => {
                    setActivePulses(curr => curr.filter(p => p.id !== pulseId));
                }, 3000);
            }
        };

        const handlePeerJoined = (data: any) => {
            setPeers(prev => [...prev, data as Peer]);
        };

        const handlePeerLeft = (data: any) => {
            setPeers(prev => prev.filter(p => p.id !== data.peer_id));
        };

        const unsubSignal = subscribe('network_signal_received', handleNewSignal);
        const unsubJoined = subscribe('peer_joined', handlePeerJoined);
        const unsubLeft = subscribe('peer_left', handlePeerLeft);

        return () => {
            unsubSignal();
            unsubJoined();
            unsubLeft();
        };
    }, [subscribe, peers, dataMode]);

    const handleToggleNetwork = async () => {
        try {
            if (!isJoined) await joinNetwork();
            setIsJoined(!isJoined);
            if (!isJoined) {
                setPeers(prev => [...prev, { id: 'local', name: 'Local-Civion', location: 'Unknown', lat: 40, lng: -100, findings_count: 0, reputation: 100, last_seen: new Date().toISOString(), shared_signals: 0 }]);
            } else {
                setPeers(prev => prev.filter(p => p.id !== 'local'));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e27] text-white p-6 space-y-6 flex flex-col pt-16 lg:pt-6">
            <DemoModeBanner />

            {dataMode === 'empty' ? (
                <EmptyState
                    health={systemState.health}
                    icon={<Globe className="w-8 h-8" />}
                    title="P2P Network Disconnected"
                    message="You must configure API keys and activate internal agents before joining the global federation."
                />
            ) : (
                <>
                    {/* HEADER & STATS ROW */}
                    <div className="flex flex-col gap-6">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[rgba(26,31,58,0.8)] backdrop-blur-[20px] p-6 rounded-xl border border-[rgba(0,255,136,0.2)] shadow-[0_0_20px_rgba(0,255,136,0.1)] gap-6 shrink-0">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-[rgba(255,0,110,0.1)] border border-[#ff006e]/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.2)] shrink-0">
                                    <Globe className="w-6 h-6 text-[#ff006e]" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-sans tracking-widest font-bold text-white uppercase">Global Network</h1>
                                    <p className="text-[#a0a0a0] font-sans text-sm mt-1">P2P Agent Intelligence Federation</p>
                                </div>
                            </div>

                            <NeonButton variant={isJoined ? "danger" : "primary"} onClick={handleToggleNetwork} className="px-6 py-2.5">
                                <Radio className="w-4 h-4 mr-2" /> {isJoined ? "Leave" : "Join Network"}
                            </NeonButton>
                        </header>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 shrink-0">
                            <div className="bg-[rgba(26,31,58,0.5)] border border-[rgba(0,255,136,0.1)] rounded-lg p-4 flex flex-col">
                                <span className="text-[10px] md:text-xs font-sans text-[#a0a0a0] uppercase tracking-wider mb-1 flex items-center whitespace-nowrap"><Users className="w-3 h-3 mr-1" /> Total Peers</span>
                                <span className="text-xl md:text-2xl font-mono text-white font-bold">{peers.length}</span>
                            </div>
                            <div className="bg-[rgba(26,31,58,0.5)] border border-[rgba(0,255,136,0.1)] rounded-lg p-4 flex flex-col">
                                <span className="text-[10px] md:text-xs font-sans text-[#a0a0a0] uppercase tracking-wider mb-1 flex items-center whitespace-nowrap"><Zap className="w-3 h-3 mr-1 text-[#00ff88]" /> Shared Today</span>
                                <span className="text-xl md:text-2xl font-mono text-[#00ff88] font-bold">1,204</span>
                            </div>
                            <div className="bg-[rgba(26,31,58,0.5)] border border-[rgba(0,255,136,0.1)] rounded-lg p-4 flex flex-col">
                                <span className="text-[10px] md:text-xs font-sans text-[#a0a0a0] uppercase tracking-wider mb-1 flex items-center whitespace-nowrap"><Shield className="w-3 h-3 mr-1 text-[#00d4ff]" /> Network Rep</span>
                                <span className="text-xl md:text-2xl font-mono text-[#00d4ff] font-bold">94.2%</span>
                            </div>
                            <div className="bg-[rgba(26,31,58,0.5)] border border-[rgba(0,255,136,0.1)] rounded-lg p-4 flex flex-col">
                                <span className="text-[10px] md:text-xs font-sans text-[#a0a0a0] uppercase tracking-wider mb-1 flex items-center whitespace-nowrap"><Signal className="w-3 h-3 mr-1 text-[#9b59b6]" /> Latency</span>
                                <span className="text-xl md:text-2xl font-mono text-[#9b59b6] font-bold">42ms</span>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT RUNS */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[600px]">

                        {/* CSS WORLD MAP */}
                        <div className="xl:col-span-2 bg-[rgba(26,31,58,0.8)] border border-[rgba(0,255,136,0.2)] rounded-xl backdrop-blur-[20px] p-6 shadow-lg flex flex-col relative overflow-hidden min-h-[400px]">
                            <div className="flex justify-between items-center mb-6 z-10">
                                <h3 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0]">Live Topology</h3>
                                <div className="flex space-x-2 items-center text-xs font-mono text-[#00ff88]">
                                    <span className="relative flex h-2 w-2">
                                        <span className={classNames("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#00ff88]")}></span>
                                        <span className={classNames("relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]")}></span>
                                    </span>
                                    Listening for broadcasts
                                </div>
                            </div>

                            {/* ... CSS Map Rendering ... */}
                            <div className="flex-1 relative w-full h-full bg-[#0a0e27] rounded-lg border border-[rgba(0,255,136,0.1)] overflow-hidden map-container shadow-inner">
                                <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, #00ff88 1px, transparent 0)',
                                    backgroundSize: '40px 40px'
                                }} />

                                {peers.map(p => {
                                    const top = `${(90 - p.lat) / 180 * 100}%`;
                                    const left = `${(180 + p.lng) / 360 * 100}%`;

                                    return (
                                        <div key={p.id} className="absolute inline-block -translate-x-1/2 -translate-y-1/2 group z-20" style={{ top, left }}>
                                            <div className="w-3 h-3 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] relative">
                                                <div className="absolute w-32 left-1/2 -translate-x-1/2 bottom-5 bg-[rgba(26,31,58,0.95)] border border-[#00ff88]/50 p-2 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mt-2 shadow-xl backdrop-blur-md">
                                                    <div className="text-xs font-bold font-sans text-white truncate">{p.name}</div>
                                                    <div className="text-[10px] text-[#a0a0a0] font-mono">{p.location}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <AnimatePresence>
                                    {activePulses.map(pulse => {
                                        const top = `${(90 - pulse.lat) / 180 * 100}%`;
                                        const left = `${(180 + pulse.lng) / 360 * 100}%`;
                                        return (
                                            <motion.div
                                                key={pulse.id}
                                                initial={{ scale: 0, opacity: 0.8 }}
                                                animate={{ scale: 6, opacity: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#ff006e] pointer-events-none z-10"
                                                style={{ top, left }}
                                            />
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: PEERS & FEED */}
                        <div className="xl:col-span-1 flex flex-col gap-6 h-full">

                            {/* PEERS LIST */}
                            <div className="flex-1 bg-[rgba(26,31,58,0.8)] border border-[rgba(0,255,136,0.2)] rounded-xl backdrop-blur-[20px] shadow-lg flex flex-col overflow-hidden min-h-[250px] max-h-[350px]">
                                <div className="p-4 border-b border-[rgba(0,255,136,0.2)] bg-[#1a1f3a]/80 shrink-0">
                                    <h3 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0]">Connected Peers</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                    {peers.map((peer, idx) => (
                                        <div key={peer.id} className={classNames(
                                            "p-4 border-b border-[rgba(0,255,136,0.05)] hover:bg-[rgba(0,255,136,0.05)] transition-colors flex items-center justify-between group",
                                            idx === peers.length - 1 ? 'border-b-0' : ''
                                        )}>
                                            <div className="flex flex-col overflow-hidden pr-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#00ff88] shrink-0" />
                                                    <span className="font-bold text-sm text-white font-sans truncate">{peer.name}</span>
                                                </div>
                                                <span className="text-xs text-[#a0a0a0] font-mono ml-4 truncate">{peer.location}</span>
                                            </div>
                                            <div className="text-right flex flex-col items-end whitespace-nowrap shrink-0">
                                                <span className="text-xs font-mono text-[#00d4ff]">Rep: {peer.reputation}%</span>
                                                <span className="text-[10px] text-[#a0a0a0] font-mono">{formatRelativeTime(peer.last_seen)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SHARED SIGNALS FEED */}
                            <div className="flex-1 bg-[rgba(26,31,58,0.8)] border border-[rgba(0,255,136,0.2)] rounded-xl backdrop-blur-[20px] shadow-lg flex flex-col overflow-hidden min-h-[250px] max-h-[400px]">
                                <div className="p-4 border-b border-[rgba(0,255,136,0.2)] bg-[#1a1f3a]/80 shrink-0">
                                    <h3 className="text-sm font-sans uppercase tracking-widest text-[#a0a0a0]">Network Intelligence</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                    {sharedSignals.length === 0 ? (
                                        <div className="text-center text-[#a0a0a0] text-sm py-8 font-sans h-full flex items-center justify-center border border-dashed border-[#a0a0a0]/20 rounded-lg bg-[rgba(26,31,58,0.5)]">
                                            Waiting for p2p broadcasts...
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            {sharedSignals.map(sig => (
                                                <motion.div
                                                    key={sig.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-3 bg-[rgba(26,31,58,0.5)] border border-[#ff006e]/20 rounded-lg flex flex-col"
                                                >
                                                    <div className="flex justify-between mb-2">
                                                        <div className="text-[10px] font-mono text-[#a0a0a0] flex items-center space-x-1 overflow-hidden">
                                                            <span className="text-[#00ff88] truncate">{sig.from_peer}</span>
                                                            <span className="shrink-0">→</span>
                                                            <span className="text-[#00d4ff] truncate">{sig.to_peer}</span>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-[#a0a0a0] shrink-0 ml-2">{new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="text-sm text-white font-sans line-clamp-2">
                                                        Signal transmission received: {sig.signal_id}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
