"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { InfoTooltip } from '../ui/InfoTooltip';

export interface ConfidenceDataPoint {
    time: string;
    confidence: number;
}

export interface ConfidenceCascadeProps {
    data: ConfidenceDataPoint[];
    currentConfidence: number;
    className?: string;
}

export function ConfidenceCascade({ data, currentConfidence, className = '' }: ConfidenceCascadeProps) {

    const formattedData = useMemo(() => {
        return data.map(d => ({
            ...d,
            percent: Math.round(d.confidence * 100)
        }));
    }, [data]);

    const latestVal = formattedData.length > 0 ? formattedData[formattedData.length - 1].percent : 0;

    // Choose color based on trend/value
    let strokeColor = 'var(--success)';
    if (latestVal < 40) strokeColor = 'var(--danger)';
    else if (latestVal < 70) strokeColor = 'var(--accent-amber)';

    return (
        <Card className={className}>
            <CardHeader className="flex items-center justify-between">
                <InfoTooltip
                    title="Confidence Cascade"
                    description="Shows how the collective confidence of the agent network changes over time as new signals are analyzed and debated."
                >
                    <span className="font-semibold flex items-center gap-1.5 cursor-help">
                        System Confidence
                        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                </InfoTooltip>

                <div className="flex items-baseline gap-1 bg-bg-subtle px-2.5 py-1 rounded-md border border-border">
                    <span className="text-xl font-mono font-bold text-text-primary" style={{ color: strokeColor }}>
                        {Math.round(currentConfidence * 100)}%
                    </span>
                </div>
            </CardHeader>

            <CardContent className="p-0 h-[220px]">
                {formattedData.length < 2 ? (
                    <div className="flex items-center justify-center h-full text-text-muted text-sm">
                        Insufficient data to show timeline
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                            />
                            <RechartsTooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: strokeColor, fontWeight: 'bold' }}
                                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                                formatter={(value: number) => [`${value}%`, 'Confidence']}
                            />
                            <Line
                                type="monotone"
                                dataKey="percent"
                                stroke={strokeColor}
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: strokeColor, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
