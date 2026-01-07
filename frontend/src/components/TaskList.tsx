'use client';

import { TaskRead } from '@/lib/api';
import { TaskItem } from './TaskItem';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface TaskListProps {
  tasks: TaskRead[];
  onToggle: (taskId: number) => Promise<void>;
  onEdit: (task: TaskRead) => void;
  onDelete: (taskId: number) => Promise<void>;
  isLoading: boolean;
}

/**
 * Task list component displaying all tasks
 */
export function TaskList({ tasks, onToggle, onEdit, onDelete, isLoading }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-0 animate-fade-in">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
