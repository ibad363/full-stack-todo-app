import React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

/**
 * Reusable Input component with label, error, and helper text support
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-secondary-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full px-3 py-2 border rounded-lg transition-all duration-200',
                        'bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'placeholder:text-secondary-400 dark:placeholder:text-secondary-500',
                        error
                            ? 'border-danger-500 focus:ring-danger-500'
                            : 'border-secondary-300 dark:border-secondary-700 hover:border-secondary-400 dark:hover:border-secondary-600',
                        'disabled:bg-secondary-50 dark:disabled:bg-secondary-900 disabled:cursor-not-allowed disabled:opacity-60',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-danger-600 animate-slide-down">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-secondary-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
