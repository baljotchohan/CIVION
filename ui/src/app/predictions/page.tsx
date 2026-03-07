'use client';

export default function Predictions() {
    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <header className="border-b border-border-color pb-4">
                <h2 className="text-2xl font-bold neon-text text-accent-secondary">■ PREDICTIVE INTELLIGENCE</h2>
                <p className="text-text-secondary text-sm">Forecasts and Accuracy Tracking</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="sci-fi-card p-6 border-accent-secondary/50 hover:border-accent-secondary">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold">🔮 Robot IPO Wave</h3>
                        <span className="bg-success/20 text-success px-2 py-1 rounded text-xs">85% CONFIDENCE</span>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                        <p className="text-text-secondary"><span className="text-accent-primary">Estimated:</span> 2025-04-15 (in 39 days)</p>
                        <p className="text-text-primary">Massive IPO wave for leading robotics companies following significant breakthroughs.</p>
                    </div>
                    <div className="bg-bg-secondary p-3 rounded font-mono text-xs text-text-secondary">
                        <p className="mb-1 text-success">[+] GitHub growth, funding surge</p>
                        <p className="text-error">[-] Market downturn risk</p>
                    </div>
                </div>

                <div className="sci-fi-card p-6 border-accent-secondary/50 hover:border-accent-secondary">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold">🔮 Hardware Breakthrough</h3>
                        <span className="bg-warning/20 text-warning px-2 py-1 rounded text-xs">72% CONFIDENCE</span>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                        <p className="text-text-secondary"><span className="text-accent-primary">Estimated:</span> 2025-02-28 (in 22 days)</p>
                        <p className="text-text-primary">New dedicated agentic neural processors announced.</p>
                    </div>
                    <div className="bg-bg-secondary p-3 rounded font-mono text-xs text-text-secondary">
                        <p className="mb-1 text-success">[+] arXiv papers spiking</p>
                        <p className="text-error">[-] Manufacturing delays</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
