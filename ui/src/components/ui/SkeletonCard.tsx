import React from 'react';
import { classNames } from '../../lib/utils';

export interface SkeletonCardProps {
    lines?: number;
    height?: string;
    className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 1, height, className }) => {
    return (
        <div
            className={classNames(
                "rounded-xl border border-[rgba(0,255,136,0.1)] bg-[rgba(26,31,58,0.5)] backdrop-blur-[20px] p-6 shadow-[0_0_20px_rgba(0,255,136,0.05)] w-full",
                className
            )}
            style={{ height }}
        >
            <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                    {Array.from({ length: lines }).map((_, i) => (
                        <div key={i} className="h-4 bg-[#1a1f3a] rounded w-full"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
