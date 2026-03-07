import type { Metadata } from 'next';
import './globals.css';

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
                {/* Sidebar */}
                <aside className="w-64 border-r border-border-color bg-bg-secondary flex flex-col">
                    <div className="p-4 border-b border-border-color">
                        <h1 className="neon-text text-xl font-bold tracking-wider">CIVION</h1>
                        <p className="text-text-secondary text-xs">AI COMMAND CENTER</p>
                    </div>
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <a href="/" className="block px-4 py-2 rounded text-accent-primary bg-bg-tertiary">Dashboard</a>
                        <a href="/reasoning" className="block px-4 py-2 rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition">Reasoning</a>
                        <a href="/predictions" className="block px-4 py-2 rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition">Predictions</a>
                        <a href="/personas" className="block px-4 py-2 rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition">Personas</a>
                        <a href="/network" className="block px-4 py-2 rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition">Network</a>
                    </nav>
                    <div className="p-4 border-t border-border-color">
                        <div className="flex items-center space-x-2">
                            <span className="status-pulse"></span>
                            <span className="text-xs text-text-secondary">SYSTEM ONLINE</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </body>
        </html>
    )
}
