'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/cn';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable Modal component with backdrop and animations
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative w-full bg-white rounded-xl shadow-large animate-scale-in',
                    sizes[size]
                )}
                role="dialog"
                aria-modal="true"
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
                        <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-secondary-400 hover:text-secondary-600 transition-colors"
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="px-6 py-4">{children}</div>
            </div>
        </div>
    );
}
