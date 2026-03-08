"use client";

import React, { useState } from 'react';
import { useSystemState } from '@/contexts/SystemStateContext';
import { NickButton } from '@/components/nick/NickButton';
import { NickPanel } from '@/components/nick/NickPanel';

export function GlobalLayoutClient() {
    const [isNickOpen, setIsNickOpen] = useState(false);
    const { health } = useSystemState();

    const handleToggleNick = () => {
        if (health === 'dead') return;
        setIsNickOpen(!isNickOpen);
    };

    return (
        <>
            <NickButton
                systemState={health}
                isOpen={isNickOpen}
                onClick={handleToggleNick}
                hasNotification={false}
            />
            <NickPanel
                isOpen={isNickOpen}
                onClose={() => setIsNickOpen(false)}
            />

            {/* Backdrop for mobile */}
            {isNickOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={() => setIsNickOpen(false)}
                />
            )}
        </>
    );
}
