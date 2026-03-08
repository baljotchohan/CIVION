"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { addToast } = useToast();
    const [saving, setSaving] = useState(false);

    // Mock settings state
    const [settings, setSettings] = useState({
        api_openai: 'sk-proj-...',
        api_anthropic: '',
        api_x: '',
        log_level: 'info',
        auto_start: true
    });

    const handleSave = async () => {
        setSaving(true);
        // Real implementation would submit to backend
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        addToast('success', 'Settings Saved', 'Configuration updated successfully.');
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-4xl mx-auto pb-20">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">System Configuration</h1>
                    <p className="text-sm text-text-secondary mt-1">Manage API keys, system behavior, and internal settings.</p>
                </div>

                <div>
                    <Button variant="primary" onClick={handleSave} loading={saving}>
                        Save Changes
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-text-primary">API Integrations</h3>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-medium text-text-primary">OpenAI API Key</label>
                        <div className="md:col-span-2">
                            <input
                                type="password"
                                value={settings.api_openai}
                                onChange={e => setSettings({ ...settings, api_openai: e.target.value })}
                                className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                placeholder="sk-..."
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-medium text-text-primary">Anthropic API Key</label>
                        <div className="md:col-span-2">
                            <input
                                type="password"
                                value={settings.api_anthropic}
                                onChange={e => setSettings({ ...settings, api_anthropic: e.target.value })}
                                className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                placeholder="sk-ant-..."
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-medium text-text-primary">X (Twitter) Bearer Token</label>
                        <div className="md:col-span-2">
                            <input
                                type="password"
                                value={settings.api_x}
                                onChange={e => setSettings({ ...settings, api_x: e.target.value })}
                                className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                                placeholder="AAAAAAAAAAAAAAAAAAAAA..."
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-text-primary">Preferences</h3>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-medium text-text-primary">Appearance</label>
                        <div className="md:col-span-2 flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio" name="theme" value="light"
                                    checked={theme === 'light'} onChange={() => setTheme('light')}
                                    className="accent-accent"
                                />
                                <span className="text-sm">Light</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio" name="theme" value="dark"
                                    checked={theme === 'dark'} onChange={() => setTheme('dark')}
                                    className="accent-accent"
                                />
                                <span className="text-sm">Dark</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio" name="theme" value="system"
                                    checked={theme === 'system'} onChange={() => setTheme('system')}
                                    className="accent-accent"
                                />
                                <span className="text-sm">System</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-medium text-text-primary">Log Level</label>
                        <div className="md:col-span-2">
                            <select
                                value={settings.log_level}
                                onChange={e => setSettings({ ...settings, log_level: e.target.value })}
                                className="bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent w-48"
                            >
                                <option value="debug">Debug (Verbose)</option>
                                <option value="info">Info (Standard)</option>
                                <option value="warn">Warnings Only</option>
                                <option value="error">Errors Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-medium text-text-primary">Auto-Start Agents</label>
                        <div className="md:col-span-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.auto_start}
                                    onChange={e => setSettings({ ...settings, auto_start: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                <span className="ml-3 text-sm text-text-secondary">Start root agents automatically with system</span>
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
