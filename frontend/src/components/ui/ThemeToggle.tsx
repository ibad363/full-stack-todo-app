'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { Button } from './Button';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 transition-all animate-scale-in" />
            ) : (
                <Sun className="w-5 h-5 transition-all animate-scale-in" />
            )}
        </Button>
    );
}
