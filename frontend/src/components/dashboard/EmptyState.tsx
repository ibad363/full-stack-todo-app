import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
    onAddTask: () => void;
}

/**
 * Empty state component when no tasks exist
 */
export function EmptyState({ onAddTask }: EmptyStateProps) {
    return (
        <div className="text-center py-16 px-4 animate-fade-in">
            <div className="mb-6">
                <svg
                    className="w-24 h-24 mx-auto text-secondary-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                </svg>
            </div>
            <h3 className="text-2xl font-semibold text-secondary-900 dark:text-white mb-2">No tasks yet</h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-8 max-w-md mx-auto">
                Get started by creating your first task. Stay organized and productive!
            </p>
            <Button onClick={onAddTask} variant="primary" size="lg">
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                Create Your First Task
            </Button>
        </div>
    );
}
