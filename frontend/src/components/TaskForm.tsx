'use client';

import { useState, useEffect } from 'react';
import { TaskRead } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { AlertCircle, Clock, CheckCircle, ChevronDown } from 'lucide-react';

interface TaskFormProps {
  task?: TaskRead | null;
  onSubmit: (data: { title: string; description?: string; priority: 'low' | 'medium' | 'high' }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

/**
 * Task form component for creating and editing tasks
 */
export function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  }, [task]);

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (description && description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  return (
    <Card className="p-6 mb-6 animate-scale-in dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800">
      <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
        {task ? 'Edit Task' : 'Create New Task'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            disabled={isLoading}
            error={errors.title}
            maxLength={200}
          />
          <p className="text-xs text-secondary-500 mt-1 text-right">
            {title.length}/200
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            disabled={isLoading}
            maxLength={2000}
            rows={4}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg transition-all duration-200 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-secondary-400 dark:placeholder:text-secondary-500 hover:border-secondary-400 dark:hover:border-secondary-600 disabled:bg-secondary-50 dark:disabled:bg-secondary-900 disabled:cursor-not-allowed disabled:opacity-60 resize-none"
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-danger-600 animate-slide-down">
              {errors.description}
            </p>
          )}
          <p className="text-xs text-secondary-500 mt-1 text-right dark:text-secondary-400">
            {description.length}/2000
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'low', label: 'Low', icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' },
              { id: 'medium', label: 'Medium', icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800' },
              { id: 'high', label: 'High', icon: AlertCircle, color: 'text-danger-500', bgColor: 'bg-danger-50 dark:bg-danger-900/20', borderColor: 'border-danger-200 dark:border-danger-800' },
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = priority === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id as any)}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200',
                    isSelected
                      ? `${p.bgColor} ${p.borderColor} ${p.color} ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-secondary-950`
                      : 'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800 text-secondary-600 dark:text-secondary-400 hover:border-secondary-300 dark:hover:border-secondary-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} variant="primary">
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
