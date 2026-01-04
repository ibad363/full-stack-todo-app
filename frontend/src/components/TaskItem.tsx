'use client';

import { useState } from 'react';
import { TaskRead } from '@/lib/api';

interface TaskItemProps {
  task: TaskRead;
  onToggle: (taskId: number) => Promise<void>;
  onEdit: (task: TaskRead) => void;
  onDelete: (taskId: number) => Promise<void>;
  isLoading: boolean;
}

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
    <li className="task-item">
      <div className="task-item-content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          disabled={isLoading}
          className="task-checkbox"
        />
        <div className="task-details">
          <span className={`task-title ${task.completed ? 'completed' : ''}`}>
            {task.title}
          </span>
          {task.description && (
            <span className="task-description">{task.description}</span>
          )}
          <span className="task-date">
            {new Date(task.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="task-actions">
        <button
          onClick={() => onEdit(task)}
          disabled={isLoading}
          className="btn btn-edit"
          aria-label="Edit task"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting || isLoading}
          className="btn btn-delete"
          aria-label="Delete task"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      <style jsx>{`
        .task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          background: white;
          transition: box-shadow 0.2s;
        }
        .task-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .task-item-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          flex: 1;
        }
        .task-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
          margin-top: 0.125rem;
        }
        .task-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .task-title {
          font-weight: 500;
          font-size: 1rem;
        }
        .task-title.completed {
          text-decoration: line-through;
          color: #6b7280;
        }
        .task-description {
          color: #6b7280;
          font-size: 0.875rem;
        }
        .task-date {
          color: #9ca3af;
          font-size: 0.75rem;
        }
        .task-actions {
          display: flex;
          gap: 0.5rem;
        }
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-edit {
          background: #3b82f6;
          color: white;
        }
        .btn-edit:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-delete {
          background: #ef4444;
          color: white;
        }
        .btn-delete:hover:not(:disabled) {
          background: #dc2626;
        }
      `}</style>
    </li>
  );
}
