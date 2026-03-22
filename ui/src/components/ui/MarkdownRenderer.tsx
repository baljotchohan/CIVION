import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-text-primary">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-text-primary marker:text-text-muted">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-text-primary">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mt-4 mb-2 text-text-primary">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mt-3 mb-1 text-text-primary">{children}</h3>,
                    code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                            <code className="bg-bg-subtle px-1.5 py-0.5 rounded text-[11px] font-mono whitespace-pre-wrap text-accent break-words">{children}</code>
                        ) : (
                            <pre className="bg-bg-subtle p-3 rounded-lg overflow-x-auto text-xs font-mono border border-border mt-2 mb-2">
                                <code className="text-text-primary">{children}</code>
                            </pre>
                        );
                    },
                    a: ({ children, href }) => <a href={href} className="text-accent hover:underline break-words" target="_blank" rel="noopener noreferrer">{children}</a>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-3 italic text-text-secondary my-2">{children}</blockquote>
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
