'use client';

export default function Network() {
    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <header className="flex justify-between items-center border-b border-border-color pb-4">
                <div>
                    <h2 className="text-2xl font-bold neon-text text-info">■ DISTRIBUTED INTELLIGENCE NETWORK</h2>
                    <p className="text-text-secondary text-sm">P2P Signal Sharing and Global Consensus</p>
                </div>
                <div className="bg-bg-secondary px-4 py-2 rounded border border-info flex space-x-4 text-sm font-mono items-center">
                    <div className="flex items-center space-x-2"><span className="status-pulse"></span> <span>10,234 PEERS ONLINE</span></div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="sci-fi-card p-6 md:col-span-2">
                    <h3 className="font-mono text-accent-secondary mb-4 border-b border-border-color pb-2">GLOBAL INTELLIGENCE MAP</h3>
                    <div className="bg-bg-primary h-64 border border-border-color flex items-center justify-center font-mono text-text-secondary text-xs rounded relative overflow-hidden group hover:border-accent-primary transition">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, var(--accent-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="z-10 text-center">
                            <span className="block mb-2">N ↑</span>
                            <p>🟢 [SF] 🟢 [NYC] 🟡 [London]</p>
                            <p className="ml-12 mt-2">🟢 [Tokyo] 🟢 [Singapore]</p>
                            <p className="mr-12 mt-2">🟡 [Berlin] 🟢 [Tel Aviv]</p>
                            <span className="block mt-2">S ↓</span>
                        </div>
                        {/* Map lines mock */}
                        <div className="absolute top-1/2 left-1/4 w-1/2 h-px bg-success/30 rotate-12" />
                        <div className="absolute top-1/3 left-1/2 w-1/3 h-px bg-success/30 -rotate-12" />
                    </div>
                </div>

                <div className="sci-fi-card flex flex-col">
                    <div className="p-6 flex-1">
                        <h3 className="font-mono text-info mb-4 border-b border-border-color pb-2">NETWORK STATS</h3>
                        <ul className="space-y-4 text-sm font-mono mt-4">
                            <li className="flex justify-between"><span className="text-text-secondary">Network:</span> <span className="text-info">ai-research-global</span></li>
                            <li className="flex justify-between"><span className="text-text-secondary">Your ID:</span> <span className="text-text-primary">peer_0x8f7a...</span></li>
                            <li className="flex justify-between"><span className="text-text-secondary">Signals Shared:</span> <span className="text-success">1,204</span></li>
                            <li className="flex justify-between"><span className="text-text-secondary">Signals Received:</span> <span className="text-warning">45,912</span></li>
                            <li className="flex justify-between"><span className="text-text-secondary">Trust Score:</span> <span className="text-accent-primary">9.8/10</span></li>
                        </ul>
                    </div>
                    <div className="p-4 border-t border-border-color bg-bg-secondary/50 flex space-x-2">
                        <button className="flex-1 text-xs border border-info text-info hover:bg-info hover:text-bg-primary transition rounded py-1">JOIN PRIVATE NET</button>
                    </div>
                </div>
            </div>

            <div className="sci-fi-card p-6 flex-1">
                <h3 className="font-mono text-success mb-4 border-b border-border-color pb-2">LIVE GLOBAL STREAM</h3>
                <div className="space-y-3 font-mono text-xs max-h-48 overflow-y-auto">
                    <div className="flex space-x-4 border-b border-border-color/50 pb-2">
                        <span className="text-text-secondary w-20">14:32:15</span>
                        <span className="text-info w-32">peer_0x9a2b...</span>
                        <span className="text-success">Verified Hypothesis: "Crypto Meta-Trend Acceleration"</span>
                    </div>
                    <div className="flex space-x-4 border-b border-border-color/50 pb-2">
                        <span className="text-text-secondary w-20">14:32:11</span>
                        <span className="text-info w-32">peer_0x1c4f...</span>
                        <span className="text-warning">New Signal: "Unusual SEC filings in biotech"</span>
                    </div>
                    <div className="flex space-x-4 border-b border-border-color/50 pb-2">
                        <span className="text-text-secondary w-20">14:31:58</span>
                        <span className="text-info w-32">peer_0x5d8e...</span>
                        <span className="text-success">Synthesizing consensus on robotics...</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
