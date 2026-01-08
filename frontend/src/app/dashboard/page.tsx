'use client';

import { useState, useEffect } from 'react';
import { api, TaskRead, TaskCreate, TaskUpdate } from '@/lib/api';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { Navbar } from '@/components/dashboard/Navbar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SearchFilter } from '@/components/dashboard/SearchFilter';
import { Plus } from 'lucide-react';

/**
 * Dashboard page - Main application interface
 */
export default function DashboardPage() {
  const [tasks, setTasks] = useState<TaskRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskRead | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

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

  const handleAddTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !task.completed) ||
      (statusFilter === 'completed' && task.completed);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <StatsCards
          pendingCount={pendingCount}
          completedCount={completedCount}
          totalCount={tasks.length}
        />

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg animate-slide-down">
            <p className="text-sm text-danger-700 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Search and Filter */}
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Task form */}
        {showForm && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancelForm}
            isLoading={submitting}
          />
        )}

        {/* Add task button */}
        {!showForm && (
          <Button
            onClick={handleAddTask}
            size="lg"
            className="w-full mb-12 py-8 bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow hover:shadow-premium transition-all duration-500 rounded-[2rem] font-bold text-xl group"
          >
            <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-500" />
            Create Your Next Masterpiece
          </Button>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState onAddTask={handleAddTask} />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggleTask}
            onEdit={handleEdit}
            onDelete={handleDeleteTask}
            isLoading={submitting}
          />
        )}
      </div>
    </div>
  );
}
