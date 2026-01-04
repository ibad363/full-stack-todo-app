'use client';

import { TaskRead } from '@/lib/api';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: TaskRead[];
  onToggle: (taskId: number) => Promise<void>;
  onEdit: (task: TaskRead) => void;
  onDelete: (taskId: number) => Promise<void>;
  isLoading: boolean;
}

export function TaskList({ tasks, onToggle, onEdit, onDelete, isLoading }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No tasks yet</h3>
        <p>Create your first task to get started!</p>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            background: #f9fafb;
            border-radius: 8px;
            border: 2px dashed #d1d5db;
          }
          .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .empty-state h3 {
            margin: 0 0 0.5rem 0;
            color: #374151;
          }
          .empty-state p {
            margin: 0;
            color: #6b7280;
          }
        `}</style>
      </div>
    );
  }

  return (
    <ul className="task-list">
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
      <style jsx>{`
        .task-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
      `}</style>
    </ul>
  );
}
