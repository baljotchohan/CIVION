import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '../components/layout/Sidebar';
import { ToastProvider } from '../contexts/ToastContext';
import { SystemStateProvider } from '../contexts/SystemStateContext';
import { AssistantProvider } from '../contexts/AssistantContext';
import { ToastNotifications } from '../components/ui/ToastNotifications';
import { AssistantButton } from '../components/assistant/AssistantButton';
import { AssistantPanel } from '../components/assistant/AssistantPanel';
import { SystemWakeAnimation } from '../components/ui/SystemWakeAnimation';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
});

const jetbrains = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
});

export const metadata: Metadata = {
    title: 'CIVION | Intelligence Command Center',
    description: 'Multi-agent AI platform with transparent reasoning and P2P global networking.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark scroll-smooth">
            <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-[#0a0e27] text-white min-h-screen flex selection:bg-[#00ff88]/30 overflow-x-hidden`}>
                <ToastProvider>
                    <SystemStateProvider>
                        <AssistantProvider>
                            {/* Fixed background effects */}
                            <div className="fixed inset-0 pointer-events-none z-[-1]">
                                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00ff88] opacity-[0.03] blur-[150px] rounded-full"></div>
                                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#9b59b6] opacity-[0.03] blur-[150px] rounded-full"></div>
                            </div>

                            <Sidebar />

                            <main className="flex-1 min-w-0 max-h-screen overflow-y-auto overflow-x-hidden relative custom-scrollbar pl-[80px] lg:pl-[240px] pt-12 lg:pt-0 transition-all duration-300">
                                {children}
                            </main>

                            {/* Global Overlays */}
                            <ToastNotifications />
                            <AssistantButton />
                            <AssistantPanel />
                            <SystemWakeAnimation />
                        </AssistantProvider>
                    </SystemStateProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
