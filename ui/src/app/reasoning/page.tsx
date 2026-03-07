'use client';
import { motion } from 'framer-motion';

export default function Reasoning() {
    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <header className="border-b border-border-color pb-4">
                <h2 className="text-2xl font-bold neon-text text-accent-primary">■ MULTI-AGENT REASONING LOOP</h2>
                <p className="text-text-secondary text-sm">Debate Timeline & Consensus Generation</p>
            </header>

            <div className="sci-fi-card p-6">
                <h3 className="font-mono text-text-secondary mb-2">HYPOTHESIS</h3>
                <p className="text-xl text-accent-secondary border-l-4 border-accent-secondary pl-4">"AI Robotics Ecosystem Accelerating"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
                <div className="sci-fi-card p-6 col-span-3 flex flex-col">
                    <h3 className="font-mono text-accent-primary mb-4 border-b border-border-color pb-2">DEBATE TIMELINE</h3>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-4 my-4">
                        {/* Agent 1 */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="pl-4 border-l-2 border-border-color relative">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-success"></div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-success text-sm flex items-center space-x-2"><span>🤖 TrendAgent</span> <span className="bg-bg-tertiary px-2 rounded text-xs px-1 text-text-secondary">[Explorer]</span></span>
                                <span className="text-xs text-text-secondary font-mono">14:32:15</span>
                            </div>
                            <p className="text-sm bg-bg-secondary p-3 rounded rounded-tl-none border border-border-color mb-2">"Robotics repos on GitHub trending +40% YoY"</p>
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-text-secondary">Evidence: GitHub API data</span>
                                <span className="text-warning">Confidence: 0.72</span>
                            </div>
                        </motion.div>

                        <div className="text-center text-text-secondary text-xs">↓ (challenges)</div>

                        {/* Agent 2 */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="pl-4 border-l-2 border-border-color relative">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-error"></div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-error text-sm flex items-center space-x-2"><span>🤖 ResearchAgent</span> <span className="bg-bg-tertiary px-2 rounded text-xs px-1 text-text-secondary">[Analyst]</span></span>
                                <span className="text-xs text-text-secondary font-mono">14:32:23</span>
                            </div>
                            <p className="text-sm bg-bg-secondary p-3 rounded rounded-tl-none border border-border-color mb-2">"But is this sustainable? Market could be hype"</p>
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-text-secondary">Evidence: arXiv trend analysis</span>
                                <span className="text-warning">Confidence: 0.65</span>
                            </div>
                        </motion.div>

                        <div className="text-center text-text-secondary text-xs">↓ (verifies)</div>

                        {/* Agent 3 */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="pl-4 border-l-2 border-border-color relative">
                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-success"></div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-success text-sm flex items-center space-x-2"><span>🤖 MarketAgent</span> <span className="bg-bg-tertiary px-2 rounded text-xs px-1 text-text-secondary">[Predictor]</span></span>
                                <span className="text-xs text-text-secondary font-mono">14:32:31</span>
                            </div>
                            <p className="text-sm bg-bg-secondary p-3 rounded rounded-tl-none border border-border-color mb-2">"Confirmed: Robotics funding +$500M this quarter"</p>
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-text-secondary">Evidence: SEC filings, Crunchbase</span>
                                <span className="text-success">Confidence: 0.89</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="sci-fi-card p-6 col-span-1 bg-success/5 border-success flex flex-col justify-center">
                    <div className="text-center mb-6">
                        <span className="text-4xl">🤖</span>
                        <h3 className="font-bold text-success mt-2">AIAgent [Synthesizer]</h3>
                        <p className="text-xs text-text-secondary">Time: 14:32:38</p>
                    </div>
                    <div className="bg-success/20 text-success text-center py-2 rounded font-bold mb-4 border border-success/50">
                        ✓ CONSENSUS REACHED
                    </div>
                    <p className="text-sm text-center mb-6">"Growth is real, sustainable for 5+ years"</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-text-secondary">Final Confidence:</span>
                            <span className="text-success font-bold">0.95</span>
                        </div>
                        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                            <motion.div className="h-full bg-success" initial={{ width: "55%" }} animate={{ width: "95%" }} transition={{ duration: 1, delay: 0.6 }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
