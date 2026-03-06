"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    Target,
    Network,
    Activity,
    Map,
    Settings,
    Database,
    ShieldAlert,
    Zap,
    Wrench,
    ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Agents", icon: Users, href: "/agents" },
    { name: "Goals", icon: Target, href: "/goals" },
    { name: "Builder", icon: Wrench, href: "/builder" },
    { name: "Marketplace", icon: ShoppingBag, href: "/market" },
    { name: "Memory", icon: Database, href: "/memory" },
    { name: "Signals", icon: Zap, href: "/signals" },
    { name: "Radar Map", icon: Map, href: "/map" },
    { name: "Logs", icon: Activity, href: "/logs" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-full flex flex-col glass border-r-0">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <img src="/logo.png" alt="CIVION" className="w-6 h-6 object-contain" />
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    CIVION
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}>
                            <div className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative",
                                isActive ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}>
                                <item.icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "group-hover:scale-110 transition-transform")} />
                                <span className="text-sm font-medium">{item.name}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="active-sidebar"
                                        className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <Link href="/settings">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        <Settings className="w-5 h-5" />
                        <span className="text-sm font-medium">Settings</span>
                    </div>
                </Link>
                <div className="mt-4 px-3 py-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">System Live</span>
                    </div>
                    <p className="text-[10px] text-slate-500">CIVION Agent OS v2.0.4-beta</p>
                </div>
            </div>
        </div>
    );
}
