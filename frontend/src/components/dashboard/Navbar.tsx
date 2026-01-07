'use client';

import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogOut } from 'lucide-react';

/**
 * Dashboard Navbar component
 */
export function Navbar() {
    const handleLogout = async () => {
        await api.logout();
    };

    return (
        <nav className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gradient dark:from-primary-400 dark:to-blue-400">TaskMaster</h1>
                    </div>

                    {/* User menu */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <ThemeToggle />
                        <div className="h-6 w-px bg-secondary-200 dark:bg-secondary-800" />
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="text-secondary-700 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white"
                        >
                            <LogOut className="w-5 h-5 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
