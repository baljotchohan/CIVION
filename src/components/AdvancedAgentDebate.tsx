'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TransparentThinkingViewer } from './TransparentThinkingViewer';
import { AdvancedDebateResult } from '@/agents/advanced-debate-engine';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

const AGENT_ACCENT: Record<string, string> = {
  '🎯 Goal Agent': 'border-l-emerald-500',
  '🔍 Research Agent': 'border-l-blue-500',
  '📊 Analysis Agent': 'border-l-yellow-500',
  '🚀 Execution Agent': 'border-l-red-500',
  '📈 Monitoring Agent': 'border-l-purple-500',
};

const AGENT_DOT: Record<string, string> = {
  '🎯 Goal Agent': 'bg-emerald-500',
  '🔍 Research Agent': 'bg-blue-500',
  '📊 Analysis Agent': 'bg-yellow-500',
  '🚀 Execution Agent': 'bg-red-500',
  '📈 Monitoring Agent': 'bg-purple-500',
};

interface Props {
  debateResult: AdvancedDebateResult;
}

export function AdvancedAgentDebate({ debateResult }: Props) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const disagreementCount = Object.keys(debateResult.disagreements).length;

  return (
    <div className="space-y-5">
      {/* Agent Response Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {debateResult.agentResponses.map((response, idx) => {
          const isExpanded = expandedAgent === response.name;
          const accentBorder = AGENT_ACCENT[response.name] || 'border-l-slate-500';
          const dot = AGENT_DOT[response.name] || 'bg-slate-500';

          return (
            <motion.div
              key={response.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`rounded-xl bg-bg-subtle border border-border border-l-4 ${accentBorder} overflow-hidden`}
            >
              {/* Header */}
              <button
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-bg-glass transition-colors text-left"
                onClick={() => setExpandedAgent(isExpanded ? null : response.name)}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
                  <span className="text-sm font-semibold text-text-primary">{response.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-bg-base rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${response.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-text-muted">
                      {Math.round(response.confidence * 100)}%
                    </span>
                  </div>
                  <span className="text-text-muted text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Response Body */}
              <div className="px-4 pb-4 pt-1 text-sm text-text-secondary">
                <MarkdownRenderer content={response.response} />
              </div>

              {/* Expandable Thinking + Recommendations */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 space-y-3 border-t border-border pt-3"
                >
                  <TransparentThinkingViewer
                    agentName={response.name}
                    thinking={response.thinking}
                    defaultExpanded
                  />

                  {response.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Recommendations
                      </h4>
                      <ul className="space-y-1.5">
                        {response.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 text-sm text-text-secondary">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Disagreements */}
      {disagreementCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-bg-subtle border border-amber-500/30 p-4"
        >
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            ⚡ Points of Disagreement ({disagreementCount})
          </h3>
          <div className="space-y-2">
            {Object.entries(debateResult.disagreements).map(([pair, diffs]) => (
              <div key={pair}>
                <p className="text-xs font-medium text-text-muted mb-1">{pair}</p>
                <ul className="space-y-1">
                  {diffs.slice(0, 3).map((d, i) => (
                    <li key={i} className="text-xs text-text-secondary flex gap-2">
                      <span className="text-amber-400">!</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Final Recommendations */}
      {debateResult.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-bg-subtle border border-accent/20 p-4"
        >
          <h3 className="text-sm font-semibold text-accent mb-3">✨ Final Recommendations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {debateResult.recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="bg-bg-base rounded-lg p-2.5 border border-border text-sm text-text-secondary"
              >
                {rec}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Confidence Score */}
      <div className="flex justify-between items-center px-1">
        <span className="text-sm text-text-muted">Overall Debate Confidence</span>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-bg-subtle rounded-full overflow-hidden border border-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${debateResult.confidenceScore * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-accent to-accent-purple rounded-full"
            />
          </div>
          <span className="text-base font-bold text-text-primary">
            {Math.round(debateResult.confidenceScore * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
