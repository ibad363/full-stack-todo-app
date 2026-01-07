'use client';

import { useState } from 'react';
import { TaskRead } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Edit2, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';

interface TaskItemProps {
  task: TaskRead;
  onToggle: (taskId: number) => Promise<void>;
  onEdit: (task: TaskRead) => void;
  onDelete: (taskId: number) => Promise<void>;
  isLoading: boolean;
}

/**
 * Individual task item component
 */
export function TaskItem({ task, onToggle, onEdit, onDelete, isLoading }: TaskItemProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <Card className="p-4 mb-3 hover:shadow-md transition-all duration-200 dark:bg-secondary-900/50">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            disabled={isLoading}
            className="w-5 h-5 text-primary-600 border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <h4
            className={`text-base font-medium mb-1 transition-all ${task.completed
              ? 'text-secondary-500 line-through dark:text-secondary-500'
              : 'text-secondary-900 dark:text-secondary-100'
              }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3 break-words">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center text-secondary-500 dark:text-secondary-400">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {new Date(task.created_at).toLocaleDateString()}
            </span>

            {/* Priority Badge */}
            {task.priority === 'high' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 border border-danger-100 dark:border-danger-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                High
              </span>
            )}
            {task.priority === 'medium' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800">
                <Clock className="w-3 h-3 mr-1" />
                Medium
              </span>
            )}
            {task.priority === 'low' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                Low
              </span>
            )}

            {task.completed ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400 border border-success-100 dark:border-success-800">
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex gap-2">
          <Button
            onClick={() => onEdit(task)}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting || isLoading}
            variant="ghost"
            size="sm"
            className="text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            isLoading={deleting}
          >
            {!deleting && <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
