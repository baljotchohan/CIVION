"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { Search, Bell, Command } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Background Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 group cursor-pointer transition-all hover:bg-white/10">
                        <Command className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">Search Intelligence...</span>
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded ml-2 text-slate-500">⌘K</span>
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-background" />
                        </button>
                        <div className="h-6 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold">User Principal</span>
                                <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-tighter">Level 4 Access</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20" />
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Outer */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
