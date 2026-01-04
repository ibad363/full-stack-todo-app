'use client';

import { useState, useEffect } from 'react';
import { api, TaskRead, TaskCreate, TaskUpdate } from '@/lib/api';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<TaskRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskRead | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.listTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskCreate) => {
    try {
      setSubmitting(true);
      const newTask = await api.createTask(data);
      setTasks([newTask, ...tasks]);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: TaskUpdate) => {
    if (!editingTask) return;

    try {
      setSubmitting(true);
      const updatedTask = await api.updateTask(editingTask.id, data);
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      setEditingTask(null);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      const toggledTask = await api.toggleTask(taskId);
      setTasks(tasks.map((t) => (t.id === taskId ? toggledTask : t)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleEdit = (task: TaskRead) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const handleLogout = async () => {
    await api.logout();
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Manager</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="dashboard-stats">
        <div className="stat">
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat">
          <span className="stat-value">{tasks.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCancelForm}
          isLoading={submitting}
        />
      )}

      {!showForm && (
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="btn-add-task"
        >
          + Add New Task
        </button>
      )}

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <TaskList
          tasks={tasks}
          onToggle={handleToggleTask}
          onEdit={handleEdit}
          onDelete={handleDeleteTask}
          isLoading={submitting}
        />
      )}

      <style jsx>{`
        .dashboard {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .dashboard-header h1 {
          margin: 0;
          font-size: 1.875rem;
          color: #111827;
        }
        .btn-logout {
          padding: 0.5rem 1rem;
          background: #e5e7eb;
          color: #374151;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        .btn-logout:hover {
          background: #d1d5db;
        }
        .dashboard-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 8px;
        }
        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }
        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .error-message {
          padding: 1rem;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .btn-add-task {
          width: 100%;
          padding: 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          transition: background-color 0.2s;
        }
        .btn-add-task:hover {
          background: #059669;
        }
        .loading {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
