"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/store/userStore";
import { useAgentStore } from "@/store/agentStore";
import { storage } from "@/services/storage";

export default function SettingsPage() {
    const { profile, hasApiKey, clearAll } = useUserStore();
    const { clearConversation } = useAgentStore();
    const [name, setName] = useState("");
    const [business, setBusiness] = useState("");
    const [occupation, setOccupation] = useState("");
    const [industry, setIndustry] = useState("");
    const [newApiKey, setNewApiKey] = useState("");
    const [testing, setTesting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [apiMessage, setApiMessage] = useState("");

    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setBusiness(profile.business);
            setOccupation(profile.occupation);
            setIndustry(profile.industry);
        }
    }, [profile]);

    const handleSaveProfile = () => {
        if (!name.trim()) return;
        storage.saveUserProfile({
            name,
            business,
            occupation,
            industry,
            goals: profile?.goals || [],
            useCase: profile?.useCase || "",
        });
        useUserStore.getState().loadFromStorage();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleUpdateApiKey = async () => {
        if (!newApiKey.trim()) return;
        setTesting(true);
        setApiMessage("");

        try {
            const { ClaudeClient } = await import("@/services/claude-api");
            const claude = new ClaudeClient(newApiKey);
            const ok = await claude.testConnection();
            if (ok) {
                storage.saveApiKey(newApiKey);
                useUserStore.getState().loadFromStorage();
                setApiMessage("✓ API key updated successfully");
                setNewApiKey("");
            } else {
                setApiMessage("✗ Connection test failed. Check your key.");
            }
        } catch {
            setApiMessage("✗ Invalid API key");
        } finally {
            setTesting(false);
        }
    };

    const handleClearData = () => {
        if (!confirm("This will erase all your data (profile, conversations, debates, goals). Are you sure?")) return;
        clearAll();
        clearConversation();
        window.location.href = "/onboarding";
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
                <p className="text-text-secondary mt-1">Manage your profile, API key, and data.</p>
            </div>

            {/* Profile */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Profile</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">Business</label>
                            <input type="text" value={business} onChange={(e) => setBusiness(e.target.value)} className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">Role</label>
                            <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1.5">Industry</label>
                            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-all" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <Button variant="primary" onClick={handleSaveProfile}>Save Profile</Button>
                        {saved && <span className="text-sm text-success">✓ Saved</span>}
                    </div>
                </CardContent>
            </Card>

            {/* API Key */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-2">Claude API Key</h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Status: {hasApiKey ? <span className="text-success font-medium">Connected ✓</span> : <span className="text-danger font-medium">Not set</span>}
                    </p>
                    <div className="flex gap-3">
                        <input
                            type="password"
                            value={newApiKey}
                            onChange={(e) => setNewApiKey(e.target.value)}
                            placeholder="sk-ant-..."
                            className="flex-1 bg-bg-subtle border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-all font-mono"
                        />
                        <Button variant="secondary" onClick={handleUpdateApiKey} disabled={testing || !newApiKey.trim()}>
                            {testing ? "Testing..." : "Update Key"}
                        </Button>
                    </div>
                    {apiMessage && (
                        <p className={`text-sm mt-2 ${apiMessage.startsWith("✓") ? "text-success" : "text-danger"}`}>
                            {apiMessage}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-danger mb-2">Danger Zone</h2>
                    <p className="text-sm text-text-secondary mb-4">
                        Clear all local data including your profile, conversations, goals, and debates. This cannot be undone.
                    </p>
                    <Button variant="danger" onClick={handleClearData}>
                        Clear All Data & Reset
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
