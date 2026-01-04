'use client';

import { useState, useEffect } from 'react';
import { TaskRead } from '@/lib/api';

interface TaskFormProps {
  task?: TaskRead | null;
  onSubmit: (data: { title: string; description?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    } else {
      setTitle('');
      setDescription('');
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
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>{task ? 'Edit Task' : 'Create New Task'}</h3>

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          disabled={isLoading}
          maxLength={200}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
        <span className="char-count">{title.length}/200</span>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          disabled={isLoading}
          maxLength={2000}
          rows={3}
          className={errors.description ? 'error' : ''}
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
        <span className="char-count">{description.length}/2000</span>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn btn-cancel"
        >
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-submit">
          {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>

      <style jsx>{`
        .task-form {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }
        .task-form h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          color: #111827;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-group input.error,
        .form-group textarea.error {
          border-color: #ef4444;
        }
        .error-message {
          display: block;
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .char-count {
          display: block;
          text-align: right;
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.25rem;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }
        .btn-cancel:hover:not(:disabled) {
          background: #d1d5db;
        }
        .btn-submit {
          background: #10b981;
          color: white;
        }
        .btn-submit:hover:not(:disabled) {
          background: #059669;
        }
      `}</style>
    </form>
  );
}
