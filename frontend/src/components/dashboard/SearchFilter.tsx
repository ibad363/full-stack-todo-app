'use client';

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface SearchFilterProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: 'all' | 'pending' | 'completed';
    setStatusFilter: (filter: 'all' | 'pending' | 'completed') => void;
}

export function SearchFilter({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
}: SearchFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-6 mb-12 animate-fade-in group">
            <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Find a task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 glass dark:bg-white/5 border-primary-500/5 dark:border-white/5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium text-lg placeholder:text-secondary-400"
                />
            </div>

            <div className="flex items-center gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="glass dark:bg-white/5 border-primary-500/5 dark:border-white/5 text-secondary-700 dark:text-white rounded-3xl px-8 py-5 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-bold text-lg cursor-pointer appearance-none min-w-[180px] text-center"
                >
                    <option value="all">Every Task</option>
                    <option value="pending">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>
    );
}
