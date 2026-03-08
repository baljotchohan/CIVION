'use client';

import React from 'react';

const GuidePage = () => {
    const sections = [
        {
            title: '1. Getting Started',
            content: (
                <div className="space-y-4">
                    <p>CIVION is an AI intelligence platform where you watch AI agents reason in real-time.</p>
                    <h4 className="font-bold">System Requirements</h4>
                    <ul className="list-disc pl-6">
                        <li>Python 3.10+</li>
                        <li>At least ONE LLM API key (or Ollama for free local AI)</li>
                        <li>500MB disk space</li>
                    </ul>
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <code className="text-cyan-400">pip install civion<br />civion setup<br />civion start</code>
                    </div>
                </div>
            )
        },
        {
            title: '2. AI Providers',
            content: (
                <div className="space-y-4">
                    <p>CIVION supports all major LLM providers. You can choose your primary provider during setup.</p>
                    <table className="min-w-full border border-slate-700">
                        <thead>
                            <tr className="bg-slate-800">
                                <th className="p-2 border border-slate-700">Provider</th>
                                <th className="p-2 border border-slate-700">Cost</th>
                                <th className="p-2 border border-slate-700">Best For</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2 border border-slate-700 text-center">Anthropic</td>
                                <td className="p-2 border border-slate-700 text-center text-yellow-400">Medium</td>
                                <td className="p-2 border border-slate-700">Best reasoning & analysis</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-slate-700 text-center">Ollama</td>
                                <td className="p-2 border border-slate-700 text-center text-green-400">FREE</td>
                                <td className="p-2 border border-slate-700">100% local, no API costs</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        },
        {
            title: '3. Agents',
            content: (
                <div className="space-y-4">
                    <p>Agents are autonomous units that monitor specific data sources and generate intelligence signals.</p>
                    <ul className="space-y-2">
                        <li><strong>GitHub Agent:</strong> Monitors code trends and repo analysis.</li>
                        <li><strong>arXiv Agent:</strong> Reads and analyzes research papers.</li>
                        <li><strong>News Agent:</strong> Tracks global news signals.</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <div className="max-w-4xl mx-auto p-8 text-slate-200">
            <h1 className="text-4xl font-bold mb-8 text-white">CIVION User Guide</h1>

            <div className="space-y-12">
                {sections.map((section, idx) => (
                    <section key={idx} className="border-b border-slate-800 pb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">{section.title}</h2>
                        <div>{section.content}</div>
                    </section>
                ))}
            </div>

            <div className="mt-12 p-6 bg-blue-900/20 border border-blue-800 rounded-xl">
                <h3 className="font-bold text-white mb-2">Need Help?</h3>
                <p>Run <code className="text-cyan-400">civion doctor</code> in your terminal to diagnose system issues.</p>
            </div>
        </div>
    );
};

export default GuidePage;
