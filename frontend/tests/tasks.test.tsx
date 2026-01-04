import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../src/components/TaskForm';
import { TaskList } from '../src/components/TaskList';
import { TaskItem } from '../src/components/TaskItem';
import DashboardPage from '../src/app/dashboard/page';

// Mock window.confirm for Delete button
window.confirm = jest.fn(() => true);

// Mock API client
jest.mock('../src/lib/api', () => ({
  api: {
    listTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    toggleTask: jest.fn(),
    deleteTask: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('Task Management UI', () => {
  const mockTasks = [
    {
      id: 1,
      user_id: 1,
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      user_id: 1,
      title: 'Task 2',
      description: 'Description 2',
      completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TaskForm', () => {
    it('creates task with valid title', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onCancel = jest.fn();

      render(
        <TaskForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={false}
        />
      );

      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Description' } });
      fireEvent.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New Description',
        });
      });
    });

    it('shows validation error for empty title', async () => {
      const onSubmit = jest.fn();
      const onCancel = jest.fn();

      render(
        <TaskForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={false}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /create task/i }));

      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('TaskList', () => {
    it('renders tasks from props', () => {
      const onToggle = jest.fn();
      const onEdit = jest.fn();
      const onDelete = jest.fn();

      render(
        <TaskList
          tasks={mockTasks}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={false}
        />
      );

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
    });

    it('renders empty state when no tasks', () => {
      render(
        <TaskList
          tasks={[]}
          onToggle={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          isLoading={false}
        />
      );

      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });

  describe('TaskItem Interactions', () => {
    it('toggles completion', async () => {
      const onToggle = jest.fn().mockResolvedValue(undefined);

      render(
        <TaskItem
          task={mockTasks[0]}
          onToggle={onToggle}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          isLoading={false}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onToggle).toHaveBeenCalledWith(mockTasks[0].id);
    });

    it('calls onDelete when delete button is clicked', async () => {
      const onDelete = jest.fn().mockResolvedValue(undefined);

      render(
        <TaskItem
          task={mockTasks[0]}
          onToggle={jest.fn()}
          onEdit={jest.fn()}
          onDelete={onDelete}
          isLoading={false}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete task/i });
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockTasks[0].id);
      });

      // Wait for the TaskItem's local state update (setDeleting(false)) to finish
      await waitFor(() => {
        expect(screen.queryByText(/deleting/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Error Handling', () => {
    it('displays error message when API call fails', async () => {
      const { api } = require('../src/lib/api');
      api.listTasks.mockRejectedValue(new Error('API Error'));

      render(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/api error/i)).toBeInTheDocument();
      });
    });

    it('displays error message when creating a task fails', async () => {
      const { api } = require('../src/lib/api');
      api.listTasks.mockResolvedValue([]);
      api.createTask.mockRejectedValue(new Error('Failed to create task'));

      render(<DashboardPage />);

      // Open the form
      fireEvent.click(screen.getByText(/\+ add new task/i));

      // Fill and submit
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New task' } });
      fireEvent.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
      });
    });
  });
});
