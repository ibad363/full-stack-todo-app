'use client';

import { useState } from 'react';
import { TaskRead } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Edit2, Trash2, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="glass p-6 mb-4 rounded-[2rem] hover:shadow-premium transition-all duration-500 border-transparent hover:border-primary-500/10 group card-hover bg-white/50 dark:bg-white/5">
      <div className="flex items-start gap-6">
        {/* Custom Toggle */}
        <button
          onClick={() => onToggle(task.id)}
          disabled={isLoading}
          className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${task.completed
            ? 'bg-primary-500 border-primary-500 text-white shadow-glow'
            : 'border-secondary-200 dark:border-white/10 hover:border-primary-500/50'
            }`}
        >
          {task.completed && <CheckCircle2 className="w-5 h-5" />}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4
              className={`text-xl font-bold font-display transition-all duration-300 ${task.completed
                ? 'text-secondary-400 line-through dark:text-white/20'
                : 'text-secondary-900 dark:text-white'
                }`}
            >
              {task.title}
            </h4>
            {task.priority === 'high' && (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>

          {task.description && (
            <p className={`text-base mb-4 break-words transition-all duration-300 ${task.completed ? 'text-secondary-300 dark:text-white/10' : 'text-secondary-600 dark:text-white/60'
              }`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center text-secondary-500 dark:text-white/40 font-medium">
              <Calendar className="w-4 h-4 mr-2 opacity-50" />
              {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>

            {/* Priority Badge */}
            <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl font-bold text-xs uppercase tracking-wider border ${task.priority === 'high'
              ? 'bg-red-500/10 text-red-500 border-red-500/20'
              : task.priority === 'medium'
                ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={() => onEdit(task)}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-xl hover:bg-primary-500/10 hover:text-primary-500 transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting || isLoading}
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
            isLoading={deleting}
          >
            {!deleting && <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
