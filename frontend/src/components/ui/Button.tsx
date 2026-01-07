import React from 'react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

/**
 * Reusable Button component with multiple variants and sizes
 */
export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md dark:bg-primary-500 dark:hover:bg-primary-400',
        secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700',
        danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-sm hover:shadow-md dark:bg-danger-500 dark:hover:bg-danger-400',
        ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 dark:text-secondary-300 dark:hover:bg-secondary-800 dark:active:bg-secondary-700',
        success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 shadow-sm hover:shadow-md dark:bg-success-500 dark:hover:bg-success-400',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}
