import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '../lib/theme';
import { ToastProvider } from '../components/ui/Toast';

import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { NickPanel } from '../components/nick/NickPanel';

import { OnboardingGuard } from '../components/layout/OnboardingGuard';
import { StoreHydrator } from './StoreHydrator';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'CIVION | Personal AI Intelligence Network',
    description: 'Your personal AI-powered intelligence network with 5 debate agents and a personal assistant.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased text-text-primary bg-bg-base overflow-hidden`}>
                <ThemeProvider>
                    <ToastProvider>
                        <StoreHydrator />
                        <div className="flex h-screen w-full">
                            <Sidebar />
                            <div className="flex-1 flex flex-col min-w-0">
                                <TopBar />
                                <div className="flex-1 flex overflow-hidden">
                                    <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                                        <OnboardingGuard>
                                            <div className="p-6 lg:p-10 max-w-full w-full">
                                                {children}
                                            </div>
                                        </OnboardingGuard>
                                    </main>
                                    {/* Persistent Agent Side Panel */}
                                    <NickPanel />
                                </div>
                            </div>

                        </div>
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
