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
        <nav className="glass sticky top-0 z-50 border-b border-primary-500/10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <h1 className="text-2xl font-bold font-display tracking-tight text-secondary-900 dark:text-white">
                            Aura<span className="text-primary-500">Task</span>
                        </h1>
                    </div>

                    {/* User menu */}
                    <div className="flex items-center space-x-2 sm:space-x-6">
                        <ThemeToggle />
                        <div className="h-8 w-px bg-secondary-200 dark:bg-white/10" />
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="lg"
                            className="text-secondary-600 dark:text-secondary-400 hover:text-primary-500 dark:hover:text-white transition-all rounded-xl"
                        >
                            <LogOut className="w-5 h-5 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline font-medium">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
