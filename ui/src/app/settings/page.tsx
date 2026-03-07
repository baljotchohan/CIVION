'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [provider, setProvider] = useState('mock');
    const [autonomous, setAutonomous] = useState(false);
    const [networkEnabled, setNetworkEnabled] = useState(false);

    return (
        <div className="p-6 space-y-6 max-w-3xl">
            <header>
                <h2 className="page-title">⚙️ Settings</h2>
                <p className="page-subtitle">Configure CIVION system preferences</p>
            </header>

            {/* LLM Provider */}
            <motion.div className="sci-fi-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-mono text-accent-primary text-sm mb-4">LLM PROVIDER</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-text-tertiary">Provider</label>
                        <select className="input-field mt-1" value={provider} onChange={e => setProvider(e.target.value)}>
                            <option value="mock">Mock (Development)</option>
                            <option value="openai">OpenAI (GPT-4o)</option>
                            <option value="anthropic">Anthropic (Claude 3.5)</option>
                            <option value="google">Google (Gemini 2.0)</option>
                        </select>
                    </div>
                    {provider !== 'mock' && (
                        <div>
                            <label className="text-xs text-text-tertiary">API Key</label>
                            <input className="input-field mt-1" type="password" placeholder="Enter API key..." />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* API Keys */}
            <motion.div className="sci-fi-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="font-mono text-accent-secondary text-sm mb-4">API KEYS</h3>
                <div className="space-y-3">
                    {['GitHub Token', 'CoinGecko Key', 'NewsAPI Key', 'NIST NVD Key'].map(key => (
                        <div key={key}>
                            <label className="text-xs text-text-tertiary">{key}</label>
                            <input className="input-field mt-1" type="password" placeholder={`Enter ${key.toLowerCase()}...`} />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* System Settings */}
            <motion.div className="sci-fi-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="font-mono text-accent-tertiary text-sm mb-4">SYSTEM</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm">Autonomous Mode</p>
                            <p className="text-xs text-text-tertiary">Agents scan on schedule automatically</p>
                        </div>
                        <button className={`w-12 h-6 rounded-full transition-all ${autonomous ? 'bg-accent-primary' : 'bg-bg-tertiary'}`} onClick={() => setAutonomous(!autonomous)}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autonomous ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm">P2P Network</p>
                            <p className="text-xs text-text-tertiary">Enable peer-to-peer intelligence sharing</p>
                        </div>
                        <button className={`w-12 h-6 rounded-full transition-all ${networkEnabled ? 'bg-accent-primary' : 'bg-bg-tertiary'}`} onClick={() => setNetworkEnabled(!networkEnabled)}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${networkEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                    <div>
                        <label className="text-xs text-text-tertiary">Scan Interval (seconds)</label>
                        <input className="input-field mt-1" type="number" defaultValue={300} min={60} />
                    </div>
                    <div>
                        <label className="text-xs text-text-tertiary">Database Path</label>
                        <input className="input-field mt-1" defaultValue="data/civion.db" />
                    </div>
                </div>
            </motion.div>

            <div className="flex space-x-3">
                <button className="btn-primary">Save Settings</button>
                <button className="btn-secondary">Reset to Defaults</button>
            </div>
        </div>
    );
}
