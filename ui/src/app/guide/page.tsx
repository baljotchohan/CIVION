'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function GuidePage() {
    const sections = [
        { id: 'getting-started', title: '1. Getting Started' },
        { id: 'ai-providers', title: '2. AI Providers' },
        { id: 'agents', title: '3. Agents' },
        { id: 'goals', title: '4. Goals & Reasoning' },
        { id: 'predictions', title: '5. Predictions' },
        { id: 'personas', title: '6. Personas' },
        { id: 'aria', title: '7. ARIA Assistant' },
        { id: 'troubleshooting', title: '8. Troubleshooting' }
    ];

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Left Nav */}
            <nav className="hidden lg:block w-[240px] sticky top-0 h-screen overflow-y-auto p-8 border-r border-[#00ff88]/20 bg-[rgba(10,14,39,0.3)]">
                <h2 className="text-xl font-bold text-white mb-2 font-sans tracking-wide">USER GUIDE</h2>
                <div className="text-xs text-[#00ff88] px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded inline-block mb-8 font-mono">
                    v2.0.0
                </div>
                <ul className="space-y-4">
                    {sections.map(sec => (
                        <li key={sec.id}>
                            <a
                                href={`#${sec.id}`}
                                className="text-sm text-gray-400 hover:text-[#00ff88] hover:border-l-2 hover:border-[#00ff88] hover:pl-3 transition-all font-sans"
                            >
                                {sec.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Content Area */}
            <div className="flex-1 p-6 lg:p-12 lg:pl-16 max-w-4xl mx-auto space-y-16 pb-24 font-sans text-gray-300 leading-relaxed">

                {/* SECTION 1 */}
                <motion.section id="getting-started" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">1. Getting Started</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">What is CIVION?</h3>
                            <p>CIVION is an AI Intelligence Command Center where you watch AI agents debate, build confidence, and make predictions in real-time. Different from regular AI tools, because you see the thinking process, not just the answer.</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">System Requirements</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Python 3.10 or higher</li>
                                <li>One LLM API key OR Ollama installed locally</li>
                                <li>500MB disk space</li>
                                <li>Internet connection (except when using local Ollama)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Installation</h3>
                            <div className="bg-[#0a0e27] p-4 rounded-lg font-mono text-sm text-[#00ff88] border border-white/10 mb-2">pip install civion</div>
                            <div className="bg-[#0a0e27] p-4 rounded-lg font-mono text-sm text-[#00ff88] border border-white/10 mb-2">civion setup</div>
                            <div className="bg-[#0a0e27] p-4 rounded-lg font-mono text-sm text-[#00ff88] border border-white/10 mb-6">civion start</div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">First Steps</h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>Run civion setup — choose your AI provider</li>
                                <li>Add your API key when prompted</li>
                                <li>Run civion start</li>
                                <li>Open http://localhost:8000 in your browser</li>
                                <li>Click &quot;Start Agents&quot; on the dashboard</li>
                                <li>Create your first goal</li>
                            </ol>
                        </div>
                    </div>
                </motion.section>

                {/* SECTION 2 */}
                <motion.section id="ai-providers" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">2. AI Providers</h2>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#1a1f3a] border-b border-[#00ff88]/50">
                                <tr>
                                    <th className="p-3">Provider</th>
                                    <th className="p-3">Best Models</th>
                                    <th className="p-3">Cost Est.</th>
                                    <th className="p-3">Best For</th>
                                    <th className="p-3">Free Tier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 align-top">
                                <tr className="bg-[rgba(26,31,58,0.5)]">
                                    <td className="p-3 text-white">Anthropic</td>
                                    <td className="p-3">Claude 3.5 Sonnet</td>
                                    <td className="p-3">$$$</td>
                                    <td className="p-3">Top-tier intelligence</td>
                                    <td className="p-3 text-gray-500">None</td>
                                </tr>
                                <tr>
                                    <td className="p-3 text-white">OpenAI</td>
                                    <td className="p-3">GPT-4o</td>
                                    <td className="p-3">$$$</td>
                                    <td className="p-3">General reasoning</td>
                                    <td className="p-3 text-gray-500">None</td>
                                </tr>
                                <tr className="bg-[rgba(26,31,58,0.5)]">
                                    <td className="p-3 text-white">Gemini</td>
                                    <td className="p-3">Gemini 1.5 Pro</td>
                                    <td className="p-3">🆓 Free</td>
                                    <td className="p-3">Fast throughput</td>
                                    <td className="p-3 text-[#00ff88]">Generous free tier</td>
                                </tr>
                                <tr>
                                    <td className="p-3 text-white">Groq</td>
                                    <td className="p-3">Llama 3 70B</td>
                                    <td className="p-3">🆓 Free</td>
                                    <td className="p-3">Instant response</td>
                                    <td className="p-3 text-[#00ff88]">Generous free tier</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-[rgba(0,212,255,0.05)] border border-[#00d4ff]/30 p-6 rounded-xl flex items-start gap-4">
                        <div className="text-3xl">💡</div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Run CIVION completely FREE with Ollama</h4>
                            <p className="text-sm">No API costs, no data sent to the cloud, full privacy. Just install Ollama and CIVION handles the rest. Setup is automatic via <code className="bg-[#0a0e27] px-1 rounded text-[#00d4ff]">civion setup</code>.</p>
                        </div>
                    </div>
                </motion.section>

                {/* SECTION 3 */}
                <motion.section id="agents" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">3. Agents</h2>
                    <p className="mb-4">Specialized AI workers that continuously monitor different data sources and extract intelligence.</p>

                    <div className="space-y-6">
                        <div className="bg-[#1a1f3a]/40 p-5 rounded-lg border border-white/10">
                            <h4 className="text-[#00ff88] font-bold mb-2">GitHub Agent</h4>
                            <p className="text-sm mb-2">Monitors code repositories and trends. Finds new libraries, trending repos, and tech adoption signals.</p>
                            <div className="text-xs font-mono text-gray-400">Start: civion agent start github</div>
                        </div>

                        <div className="bg-[#1a1f3a]/40 p-5 rounded-lg border border-white/10">
                            <h4 className="text-[#00ff88] font-bold mb-2">arXiv Agent</h4>
                            <p className="text-sm mb-2">Reads research papers continuously. Finds new discoveries, emerging fields, and breakthroughs.</p>
                            <div className="text-xs font-mono text-gray-400">Start: civion agent start arxiv</div>
                        </div>

                        <div className="bg-[#1a1f3a]/40 p-5 rounded-lg border border-white/10">
                            <h4 className="text-[#00ff88] font-bold mb-2">Market Agent</h4>
                            <p className="text-sm mb-2">Tracks crypto and stock signals. Finds price movements, market sentiment, and financial trends.</p>
                            <div className="text-xs font-mono text-gray-400">Start: civion agent start market</div>
                        </div>

                        <div className="bg-[#1a1f3a]/40 p-5 rounded-lg border border-white/10">
                            <h4 className="text-[#00ff88] font-bold mb-2">Security Agent</h4>
                            <p className="text-sm mb-2">Monitors CVEs and threat intelligence. Finds new vulnerabilities and attack patterns.</p>
                            <div className="text-xs font-mono text-gray-400">Start: civion agent start security</div>
                        </div>

                        <div className="bg-[#1a1f3a]/40 p-5 rounded-lg border border-white/10">
                            <h4 className="text-[#00ff88] font-bold mb-2">News Agent</h4>
                            <p className="text-sm mb-2">Reads global news sources. Finds breaking developments and narrative shifts.</p>
                            <div className="text-xs font-mono text-gray-400">Start: civion agent start news</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 border border-[#9b59b6]/30 bg-[#9b59b6]/10 rounded-lg">
                        <h4 className="text-white font-bold mb-2">Agent Status Indicators</h4>
                        <ul className="text-sm space-y-2">
                            <li><span className="text-[#00ff88] font-bold">Green pulse</span> = running and finding signals</li>
                            <li><span className="text-[#00d4ff] font-bold">Cyan pulse</span> = ready but not started</li>
                            <li><span className="text-gray-500 font-bold">Grey</span> = no API key configured</li>
                            <li><span className="text-[#ff006e] font-bold">Red flash</span> = error — check logs</li>
                        </ul>
                    </div>
                </motion.section>

                {/* SECTION 4 */}
                <motion.section id="goals" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">4. Goals & Reasoning</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">What is a goal?</h3>
                            <p>A question or topic you want CIVION to investigate. Example: &quot;Is quantum computing becoming mainstream?&quot;</p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-2">How to create a goal:</h3>
                            <ul className="list-disc pl-6">
                                <li>Option 1: Dashboard → &quot;New Goal&quot; button</li>
                                <li>Option 2: ARIA assistant → &quot;Create a goal about X&quot;</li>
                                <li>Option 3: CLI → <code className="font-mono text-[#00ff88]">civion goal create &quot;your question&quot;</code></li>
                            </ul>
                        </div>

                        <div className="bg-[rgba(0,255,136,0.05)] border border-[#00ff88]/20 p-6 rounded-xl">
                            <h3 className="text-white font-bold mb-4">Reasoning Loop Workflow</h3>
                            <ol className="list-decimal pl-5 space-y-2 text-sm">
                                <li>Goal created → assigned to relevant agents</li>
                                <li>Agents gather evidence from their data sources</li>
                                <li>Reasoning loop starts — agents debate the evidence</li>
                                <li><strong className="text-[#00d4ff]">Proposer:</strong> makes the initial claim</li>
                                <li><strong className="text-[#ff006e]">Challenger:</strong> finds holes and counter-evidence</li>
                                <li><strong className="text-[#00ff88]">Verifier:</strong> cross-references and confirms</li>
                                <li><strong className="text-[#9b59b6]">Synthesizer:</strong> merges into a final conclusion</li>
                                <li>Confidence score is calculated based on consensus</li>
                                <li>Prediction is generated if confidence &gt; 70%</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-2">Reading Confidence Scores</h3>
                            <ul className="space-y-1 text-sm">
                                <li><span className="text-[#ff006e] w-16 inline-block">0-40%</span> Low confidence — conflicting evidence</li>
                                <li><span className="text-yellow-500 w-16 inline-block">40-70%</span> Medium confidence — partial support</li>
                                <li><span className="text-[#00ff88] w-16 inline-block">70-90%</span> High confidence — strong evidence</li>
                                <li><strong className="text-emerald-400 w-16 inline-block">90-100%</strong> Very high — verified by network</li>
                            </ul>
                        </div>
                    </div>
                </motion.section>

                {/* SECTION 5 */}
                <motion.section id="predictions" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">5. Predictions</h2>
                    <p className="mb-4">When confidence exceeds 70%, CIVION generates a probabilistic prediction about future events based on the reasoning loop consensus.</p>

                    <div className="space-y-4">
                        <p><strong>Probability %:</strong> likelihood this will happen</p>
                        <p><strong>Timeframe:</strong> when CIVION expects it to happen</p>
                        <p><strong>Evidence:</strong> what signals led to this prediction</p>
                        <p><strong>Accuracy tracking:</strong> CIVION tracks whether its predictions come true. Good benchmark: &gt;65% accuracy is excellent for automated predictions.</p>
                    </div>
                </motion.section>

                {/* SECTION 6 */}
                <motion.section id="personas" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">6. Personas</h2>
                    <p className="mb-4">Personas are analytical lenses that apply different perspectives to the same data.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                        <div className="p-4 border border-white/10 rounded-lg">
                            <strong className="text-white block mb-1">The Investor 📈</strong>
                            Looks for ROI, market opportunities and financial impact.
                        </div>
                        <div className="p-4 border border-white/10 rounded-lg">
                            <strong className="text-white block mb-1">The Scientist 🔬</strong>
                            Focuses on methodology, peer review and empirical evidence.
                        </div>
                        <div className="p-4 border border-white/10 rounded-lg">
                            <strong className="text-white block mb-1">The Skeptic 🤔</strong>
                            Challenges every claim aggressively to find logical flaws.
                        </div>
                        <div className="p-4 border border-white/10 rounded-lg">
                            <strong className="text-white block mb-1">The Journalist 📝</strong>
                            Asks what the human story is and broader implications.
                        </div>
                    </div>

                    <h4 className="text-white font-bold mb-2">Sharing personas:</h4>
                    <p>Click Share on any persona card. Other CIVION users on the network can discover it, and its usage count increases each time someone applies it.</p>
                </motion.section>

                {/* SECTION 7 */}
                <motion.section id="aria" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">7. ARIA Assistant</h2>
                    <p className="mb-6">ARIA (Adaptive Reasoning Intelligence Assistant) is your built-in AI assistant. Click the button bottom-right of any page to open ARIA.</p>

                    <p className="mb-4">ARIA can see everything happening in your CIVION: all agent states, recent signals, predictions, confidence scores, and network peers.</p>

                    <div className="bg-[#1a1f3a]/60 p-6 rounded-xl border border-white/10 mb-6">
                        <h4 className="text-white font-bold mb-4">Example questions to ask ARIA:</h4>
                        <ul className="space-y-3 font-mono text-sm text-[#00d4ff]">
                            <li>&quot;What are agents finding right now?&quot;</li>
                            <li>&quot;Why is my confidence score low?&quot;</li>
                            <li>&quot;Start the GitHub agent&quot;</li>
                            <li>&quot;Create a goal about AI regulation&quot;</li>
                            <li>&quot;Which predictions have the highest confidence?&quot;</li>
                            <li>&quot;How do I add an OpenAI API key?&quot;</li>
                        </ul>
                    </div>

                    <p className="text-sm text-gray-400"><strong>Note:</strong> ARIA can only see data that is loaded into your CIVION system. It cannot browse the internet directly unless utilizing an agent.</p>
                </motion.section>

                {/* SECTION 8 */}
                <motion.section id="troubleshooting" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">8. Troubleshooting</h2>

                    <div className="space-y-4">
                        <details className="p-4 border border-white/10 rounded-lg cursor-pointer bg-white/5 data-[open]:bg-white/10 transition-colors">
                            <summary className="font-bold text-white outline-none">CIVION won&apos;t start — port already in use</summary>
                            <div className="mt-3 text-sm font-mono text-gray-400">
                                Run: civion doctor<br />
                                Or manually: lsof -ti:8000 | xargs kill
                            </div>
                        </details>

                        <details className="p-4 border border-white/10 rounded-lg cursor-pointer bg-white/5 data-[open]:bg-white/10 transition-colors">
                            <summary className="font-bold text-white outline-none">Agents won&apos;t start — &quot;No LLM configured&quot;</summary>
                            <div className="mt-3 text-sm text-gray-400">
                                You need to add an API key in Settings.<br />
                                Or run CLI: <code className="text-[#00ff88]">civion config add-key anthropic</code>
                            </div>
                        </details>

                        <details className="p-4 border border-white/10 rounded-lg cursor-pointer bg-white/5 data-[open]:bg-white/10 transition-colors">
                            <summary className="font-bold text-white outline-none">UI shows but agents show grey/dead state</summary>
                            <div className="mt-3 text-sm text-gray-400">
                                This is correct behavior when no API key is set.<br />
                                Go to Settings → add your LLM provider key to wake the system.
                            </div>
                        </details>

                        <details className="p-4 border border-white/10 rounded-lg cursor-pointer bg-white/5 data-[open]:bg-white/10 transition-colors">
                            <summary className="font-bold text-white outline-none">Predictions are not generating</summary>
                            <div className="mt-3 text-sm text-gray-400">
                                Confidence must exceed 70% to trigger predictions.<br />
                                Make sure at least 2 agents are running and your LLM key is valid.
                            </div>
                        </details>

                        <details className="p-4 border border-white/10 rounded-lg cursor-pointer bg-white/5 data-[open]:bg-white/10 transition-colors">
                            <summary className="font-bold text-white outline-none">Where are my API keys stored?</summary>
                            <div className="mt-3 text-sm text-gray-400">
                                <code className="text-[#00ff88]">~/.civion/.secrets</code> — encrypted at rest, never logged.
                            </div>
                        </details>

                        <details className="p-4 border border-white/10 rounded-lg cursor-pointer bg-white/5 data-[open]:bg-white/10 transition-colors">
                            <summary className="font-bold text-white outline-none">How do I reset everything and start fresh?</summary>
                            <div className="mt-3 text-sm text-gray-400">
                                <code className="text-[#00ff88]">civion reset</code><br />
                                This clears your config but keeps your database intact.
                            </div>
                        </details>
                    </div>
                </motion.section>

            </div>
        </div>
    );
}
