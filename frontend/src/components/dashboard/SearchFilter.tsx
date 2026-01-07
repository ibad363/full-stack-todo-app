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
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-soft"
                />
            </div>

            <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-secondary-400 hidden sm:block" />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-soft min-w-[140px]"
                >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>
    );
}
