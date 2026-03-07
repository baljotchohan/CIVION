'use client';

export default function Personas() {
    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <header className="border-b border-border-color pb-4">
                <h2 className="text-2xl font-bold neon-text text-accent-tertiary">■ CUSTOM PERSONAS</h2>
                <p className="text-text-secondary text-sm">Infinite Perspectives Gallery</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="sci-fi-card p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-2 text-accent-primary">🎭 Shakespeare Agent</h3>
                        <p className="text-xs text-text-secondary mb-4 border-b border-border-color pb-2">Created by: You</p>
                        <p className="text-sm">"Analyzes technology like poetry"</p>
                        <p className="text-xs text-text-secondary font-mono mt-4">Style: Metaphorical, Creative</p>
                    </div>
                    <div className="mt-6 flex justify-between items-center text-xs">
                        <span className="text-warning">Used: 47 times</span>
                        <span className="text-accent-secondary">★★★★★ (4.8)</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button className="flex-1 bg-accent-primary text-bg-primary font-bold py-1 rounded hover:bg-success transition">RUN</button>
                        <button className="flex-1 border border-border-color hover:border-accent-primary rounded transition">EDIT</button>
                    </div>
                </div>

                <div className="sci-fi-card p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-2 text-accent-secondary">🎭 Elon Musk Agent</h3>
                        <p className="text-xs text-text-secondary mb-4 border-b border-border-color pb-2">Created by: Community</p>
                        <p className="text-sm">"First-principles thinking applied to intelligence signals"</p>
                        <p className="text-xs text-text-secondary font-mono mt-4">Style: Analytical, Visionary</p>
                    </div>
                    <div className="mt-6 flex justify-between items-center text-xs">
                        <span className="text-warning">Used: 1,234 times</span>
                        <span className="text-accent-secondary">★★★★★ (4.9)</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button className="flex-1 bg-accent-secondary text-bg-primary font-bold py-1 rounded hover:opacity-80 transition">FORK</button>
                    </div>
                </div>

                <div className="sci-fi-card p-6 flex items-center justify-center border-dashed border-2 border-border-color hover:border-accent-primary cursor-pointer transition group">
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                        <div className="text-4xl text-accent-tertiary mb-2">+</div>
                        <h3 className="text-lg font-bold">Create New Persona</h3>
                        <p className="text-xs text-text-secondary mt-2">Define your own analysis style</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
