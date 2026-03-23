'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface ThinkingData {
  steps: string[];
  reasoning: string;
  confidence: number;
  sources?: string[];
}

interface TransparentThinkingViewerProps {
  agentName: string;
  thinking: ThinkingData;
  defaultExpanded?: boolean;
}

export function TransparentThinkingViewer({
  agentName,
  thinking,
  defaultExpanded = false,
}: TransparentThinkingViewerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const confidenceColor =
    thinking.confidence >= 0.75
      ? 'from-emerald-500 to-green-400'
      : thinking.confidence >= 0.5
      ? 'from-yellow-500 to-amber-400'
      : 'from-red-500 to-orange-400';

  return (
    <div className="rounded-xl bg-bg-subtle border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex justify-between items-center hover:bg-bg-glass transition-colors text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">💭</span>
          <span className="text-sm font-semibold text-text-primary">
            {agentName}&apos;s Thinking
          </span>
          <span className="text-xs text-text-muted">
            ({thinking.steps.length} step{thinking.steps.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-secondary">
            {Math.round(thinking.confidence * 100)}% confidence
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-muted"
          >
            <ChevronDown size={16} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {/* Reasoning Steps */}
              {thinking.steps.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Reasoning Steps
                  </h4>
                  <div className="space-y-1.5">
                    {thinking.steps.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex gap-2.5 p-2.5 rounded-lg bg-bg-base"
                      >
                        <span className="text-accent font-bold text-xs min-w-[18px] mt-0.5">
                          {idx + 1}.
                        </span>
                        <span className="text-sm text-text-secondary">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Reasoning */}
              {thinking.reasoning && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Overall Reasoning
                  </h4>
                  <p className="text-sm text-text-secondary bg-bg-base rounded-lg p-3 leading-relaxed">
                    {thinking.reasoning}
                  </p>
                </div>
              )}

              {/* Confidence Bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Confidence
                  </h4>
                  <span className="text-xs font-bold text-text-primary">
                    {Math.round(thinking.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${thinking.confidence * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${confidenceColor} rounded-full`}
                  />
                </div>
              </div>

              {/* Sources */}
              {thinking.sources && thinking.sources.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Sources Referenced
                  </h4>
                  <div className="space-y-1">
                    {thinking.sources.map((source, idx) => (
                      <div key={idx} className="flex gap-2 text-xs text-text-muted">
                        <span>📖</span>
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
