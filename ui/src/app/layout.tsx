import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '../lib/theme';
import { SystemStateProvider } from '../contexts/SystemStateContext';
import { AssistantProvider } from '../hooks/useAssistant';
import { ToastProvider, ToastContainer } from '../components/ui/Toast';

import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { NickButton } from '../components/nick/NickButton';
import { NickPanel } from '../components/nick/NickPanel';
import { GlobalLayoutClient } from './GlobalLayoutClient';
import { OnboardingGuard } from '../components/layout/OnboardingGuard';

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
    title: 'CIVION | AI Intelligence System',
    description: 'Glass-box artificial intelligence network',
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
                        <SystemStateProvider>
                            <AssistantProvider>
                                <div className="flex h-screen w-full">
                                    <Sidebar />
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <TopBar />
                                        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                                            <OnboardingGuard>
                                                <div className="p-6 lg:p-10 max-w-7xl w-full">
                                                    {children}
                                                </div>
                                            </OnboardingGuard>
                                        </main>
                                    </div>
                                    <GlobalLayoutClient />
                                </div>
                            </AssistantProvider>
                        </SystemStateProvider>
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
