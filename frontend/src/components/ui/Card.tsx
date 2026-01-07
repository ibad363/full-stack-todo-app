import React from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

/**
 * Reusable Card component with optional hover effect
 */
export function Card({ children, className, hover = false, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-800 shadow-soft',
                hover && 'card-hover cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
