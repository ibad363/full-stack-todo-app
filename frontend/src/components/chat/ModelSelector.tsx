// frontend/src/components/chat/ModelSelector.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface Model {
    value: string;
    label: string;
    description?: string;
}

interface ModelSelectorProps {
    models: Model[];
    selectedModel: string;
    onModelChange: (model: string) => void;
}

export function ModelSelector({ models, selectedModel, onModelChange }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedModelData = models.find(m => m.value === selectedModel) || models[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-700 rounded-xl hover:shadow-md transition-all duration-200 group"
            >
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400 group-hover:rotate-12 transition-transform" />
                <div className="flex flex-col items-start">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Model</span>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                        {selectedModelData.label}
                    </span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-secondary-500 dark:text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 px-3 py-2">
                            Select AI Model
                        </div>
                        {models.map((model) => (
                            <button
                                key={model.value}
                                onClick={() => {
                                    onModelChange(model.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${selectedModel === model.value
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/50 text-secondary-700 dark:text-secondary-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{model.label}</span>
                                    {selectedModel === model.value && (
                                        <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                                    )}
                                </div>
                                {model.description && (
                                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                        {model.description}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
