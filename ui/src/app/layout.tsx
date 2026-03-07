import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
    title: 'CIVION - AI Intelligence Command Center',
    description: 'Production-grade multi-agent intelligence platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-bg-primary text-text-primary h-screen flex overflow-hidden">
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </body>
        </html>
    )
}
