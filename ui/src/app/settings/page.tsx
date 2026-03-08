'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemState } from '../../hooks/useSystemState';
import { saveConfig, testKey } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { Activity, CheckCircle, Database, Server, Key, AlertTriangle, ShieldCheck } from 'lucide-react';
import { classNames } from '../../lib/utils';
import { fadeIn, staggerContainer } from '../../lib/animations';

export default function SettingsPage() {
    const { systemState, setSystemState } = useSystemState();
    const { health, apiKeys, backendOnline, wsConnected, agentsRunning, agentsTotal } = systemState;
    const { toast } = useToast();
    const [isTesting, setIsTesting] = useState<Record<string, boolean>>({});

    const [localKeys, setLocalKeys] = useState<{ [key: string]: string }>({
        anthropic: '',
        openai: '',
        github: '',
        arxiv: '',
        coingecko: ''
    });

    const handleKeyChange = (provider: string, val: string) => {
        setLocalKeys(prev => ({ ...prev, [provider]: val }));
    };

    const handleTestKey = async (provider: string) => {
        const val = localKeys[provider] || '';
        if (!val) {
            toast(`Please enter a key for ${provider} to test`, 'warning');
            return;
        }
        setIsTesting(prev => ({ ...prev, [provider]: true }));
        try {
            const res = await testKey(provider, val);
            if (res.valid) {
                toast(`Successfully verified ${provider} key`, 'success');
            } else {
                toast(`Invalid ${provider} key: ${res.message}`, 'error');
            }
        } catch (error: any) {
            toast(`Error testing ${provider} key: ${error.message || 'Network error'}`, 'error');
        } finally {
            setIsTesting(prev => ({ ...prev, [provider]: false }));
        }
    };

    const handleSaveKey = async (provider: string) => {
        const val = localKeys[provider] || '';
        if (!val) {
            toast(`Please enter a key for ${provider} to save`, 'warning');
            return;
        }
        try {
            await saveConfig(provider, val);
            const wasDead = health === 'dead';

            // Optimistically update
            setSystemState(prev => ({
                ...prev,
                apiKeys: { ...prev.apiKeys, [provider]: true },
                health: wasDead ? 'idle' : prev.health
            }));

            toast(`${provider} key saved securely`, 'success');

            if (wasDead) {
                toast("🚀 CIVION is now online!", 'success');
                // SystemStateContext handles the animation automatically
                // via health state transition detection
            }
        } catch (error: any) {
            toast(`Failed to save ${provider} key: ${error.message || 'Unknown error'}`, 'error');
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen">
            <header className="mb-10">
                <h1 className="text-3xl font-black font-sans tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                    System Configuration
                </h1>
                <p className="text-[#a0a0a0] font-sans">Manage API connections, data sources, and system preferences.</p>
            </header>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Right Column: System Status Card */}
                <div className="lg:col-span-1 lg:col-start-3 space-y-6">
                    <motion.div
                        variants={fadeIn}
                        className={classNames(
                            "rounded-2xl border p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-700",
                            health === 'dead' ? "bg-[rgba(60,60,80,0.4)] border-white/5"
                                : health === 'idle' ? "bg-[rgba(26,31,58,0.6)] border-[#00d4ff]/30 shadow-[0_0_30px_rgba(0,212,255,0.1)]"
                                    : "bg-[rgba(26,31,58,0.9)] border-[#00ff88]/30 shadow-[0_0_30px_rgba(0,255,136,0.15)]"
                        )}
                    >
                        {/* Glow bg */}
                        <div className={classNames(
                            "absolute inset-0 pointer-events-none transition-opacity duration-1000",
                            health === 'alive' ? "opacity-20" : health === 'idle' ? "opacity-10" : "opacity-0"
                        )} style={{ background: `radial-gradient(circle at top right, ${health === 'alive' ? '#00ff88' : '#00d4ff'} 0%, transparent 60%)` }} />

                        <div className="relative z-10">
                            <h3 className="text-xs font-mono uppercase tracking-widest text-[#a0a0a0] mb-6 flex items-center">
                                <Activity className="w-4 h-4 mr-2" />
                                Current Status
                            </h3>

                            <div className="mb-8">
                                <div className="text-[10px] uppercase font-mono text-gray-500 tracking-wider mb-2">Core Identity</div>
                                <div className="flex items-center space-x-3">
                                    <span className={classNames(
                                        "w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]",
                                        health === 'dead' ? 'bg-[#3c3c50] text-[#3c3c50]'
                                            : health === 'idle' ? 'bg-[#00d4ff] text-[#00d4ff] animate-pulse'
                                                : 'bg-[#00ff88] text-[#00ff88]'
                                    )} />
                                    <span className="text-3xl font-black tracking-widest uppercase font-sans">
                                        {health}
                                    </span>
                                </div>
                                {health === 'dead' && (
                                    <p className="text-sm font-sans mt-3 text-gray-400">System is in SLUMBER. Awaiting required provider keys.</p>
                                )}
                                {health === 'idle' && (
                                    <p className="text-sm font-sans mt-3 text-gray-400">Ready. Awaiting agent execution.</p>
                                )}
                                {health === 'alive' && (
                                    <p className="text-sm font-sans mt-3 text-[#00ff88]">System fully operational.</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div className="flex items-center text-sm font-mono text-white">
                                        <Server className="w-4 h-4 mr-3 text-[#a0a0a0]" />
                                        Backend API
                                    </div>
                                    <span className={classNames("text-xs font-mono px-2 py-0.5 rounded", backendOnline ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20" : "bg-[#ff006e]/10 text-[#ff006e] border border-[#ff006e]/20")}>
                                        {backendOnline ? 'CONNECTED' : 'OFFLINE'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div className="flex items-center text-sm font-mono text-white">
                                        <Activity className="w-4 h-4 mr-3 text-[#a0a0a0]" />
                                        WebSocket
                                    </div>
                                    <span className={classNames("text-xs font-mono px-2 py-0.5 rounded", wsConnected ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20" : "bg-[#ff006e]/10 text-[#ff006e] border border-[#ff006e]/20")}>
                                        {wsConnected ? 'ACTIVE' : 'DISCONNECTED'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pb-1">
                                    <div className="flex items-center text-sm font-mono text-white">
                                        <Database className="w-4 h-4 mr-3 text-[#a0a0a0]" />
                                        Agents
                                    </div>
                                    <span className="text-sm font-mono text-[#00d4ff]">
                                        {agentsRunning} / {agentsTotal}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Left Column: Forms */}
                <div className="lg:col-span-2 lg:col-start-1 row-start-1 space-y-6">

                    {/* Primary Provider */}
                    <motion.div variants={fadeIn} className="bg-[rgba(10,14,39,0.8)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                        {/* Glow for required missing */}
                        {!apiKeys.anthropic && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff006e]/10 blur-[50px] pointer-events-none" />
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9b59b6] to-[#7f4296] flex items-center justify-center border border-white/10 shadow-lg">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold font-sans tracking-wide">Primary LLM Provider *</h2>
                                    <p className="text-xs text-[#a0a0a0] font-sans">Core intelligence engine. Required to wake system.</p>
                                </div>
                            </div>
                            {apiKeys.anthropic && <CheckCircle className="w-6 h-6 text-[#00ff88]" />}
                        </div>

                        <div className="space-y-5 bg-[#1a1f3a]/50 p-5 rounded-xl border border-white/5">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-mono text-white">Anthropic API Key</label>
                                    <span className="text-[10px] text-[#ff006e] font-mono border border-[#ff006e]/30 bg-[#ff006e]/10 px-1.5 py-0.5 rounded">REQUIRED</span>
                                </div>
                                <div className="flex space-x-3">
                                    <input
                                        type="password"
                                        value={localKeys.anthropic}
                                        onChange={(e) => handleKeyChange('anthropic', e.target.value)}
                                        placeholder={apiKeys.anthropic ? "•••••••••••••••• (Key Configured)" : "sk-ant-..."}
                                        className="flex-1 bg-[#0a0e27] border border-white/10 rounded-lg pl-4 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#9b59b6]/50 transition-colors font-mono"
                                    />
                                    <button
                                        onClick={() => handleTestKey('anthropic')}
                                        disabled={isTesting.anthropic}
                                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-mono transition-colors disabled:opacity-50"
                                    >
                                        Test
                                    </button>
                                    <button
                                        onClick={() => handleSaveKey('anthropic')}
                                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#9b59b6] to-[#7f4296] hover:opacity-90 transition-opacity border border-white/20 text-sm font-mono shadow-[0_0_15px_rgba(155,89,182,0.3)] font-bold text-white uppercase tracking-wider"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Secondary Providers */}
                    <motion.div variants={fadeIn} className="bg-[rgba(10,14,39,0.8)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                <Key className="w-5 h-5 text-[#a0a0a0]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold font-sans tracking-wide">Data & Intelligence Sources</h2>
                                <p className="text-xs text-[#a0a0a0] font-sans">Optional plugins to enhance reasoning capabilities.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {['openai', 'github', 'coingecko'].map((provider) => {
                                const names: Record<string, string> = {
                                    openai: 'OpenAI (Secondary LLM)',
                                    github: 'GitHub Token',
                                    coingecko: 'CoinGecko Pro Key'
                                };
                                const colors: Record<string, string> = {
                                    openai: '#10a37f',
                                    github: '#ffffff',
                                    coingecko: '#8dc63f'
                                };
                                const isConfigured = apiKeys[provider as keyof typeof apiKeys];

                                return (
                                    <div key={provider} className="bg-[#1a1f3a]/30 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-mono text-gray-300" style={{ color: isConfigured ? colors[provider] : '#a0a0a0' }}>
                                                    {names[provider]}
                                                </label>
                                                {isConfigured && <CheckCircle className="w-4 h-4 text-[#00ff88]" />}
                                            </div>
                                            <input
                                                type="password"
                                                value={localKeys[provider] || ''}
                                                onChange={(e) => handleKeyChange(provider, e.target.value)}
                                                placeholder={isConfigured ? "•••••••••••••••• (Configured)" : "Enter key..."}
                                                className="w-full bg-[#0a0e27] border border-white/10 rounded-lg pl-4 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-mono"
                                            />
                                        </div>
                                        <div className="flex space-x-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleTestKey(provider)}
                                                disabled={isTesting[provider] || !localKeys[provider]}
                                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-mono transition-colors disabled:opacity-50"
                                            >
                                                Test
                                            </button>
                                            <button
                                                onClick={() => handleSaveKey(provider)}
                                                disabled={!localKeys[provider]}
                                                className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-sm font-mono text-white disabled:opacity-30 disabled:hover:bg-white/10"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
