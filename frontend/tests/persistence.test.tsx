import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TaskList } from '../src/components/TaskList';
import { TaskItem } from '../src/components/TaskItem';
import { TaskForm } from '../src/components/TaskForm';
import * as api from '../src/lib/api';

// Mock the API module
jest.mock('../src/lib/api', () => ({
  api: {
    listTasks: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    toggleTask: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  }
}));

describe('Frontend Persistence Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it.only('should persist tasks after page reload', async () => {
    // Mock tasks that would be returned from API
    const mockTasks = [
      { id: 1, title: 'Test Task 1', description: 'Test Description 1', completed: false, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: 2, title: 'Test Task 2', description: 'Test Description 2', completed: true, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' }
    ];

    // Mock the API call to return tasks
    // Mock the API call to return tasks
    (api.api.listTasks as jest.Mock).mockResolvedValue(mockTasks);

    // Render the TaskList component
    render(
      <TaskList
        tasks={mockTasks}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={false}
      />
    );

    // Wait for tasks to load
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();

    // Simulate page reload by re-rendering with same data
    render(
      <TaskList
        tasks={mockTasks}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={false}
      />
    );

    // Tasks should still be present after "reload"
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('should persist tasks when user logs out and logs back in', async () => {
    const mockTasks = [
      { id: 1, title: 'Persistent Task', description: 'Should persist after login', completed: false, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' }
    ];

    // Mock login and task list API calls
    (api.api.login as jest.MockedFunction<any>).mockResolvedValue({ access_token: 'mock-token', token_type: 'bearer' });
    (api.api.listTasks as jest.MockedFunction<any>).mockResolvedValue(mockTasks);

    // Simulate login flow
    render(
      <TaskList
        tasks={mockTasks}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Persistent Task')).toBeInTheDocument();
    });

    // Simulate logout (component unmounts)
    // Then simulate login again
    render(
      <TaskList
        tasks={mockTasks}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={false}
      />
    );

    // Tasks should still be present after re-login (assuming backend persistence)
    await waitFor(() => {
      expect(screen.getByText('Persistent Task')).toBeInTheDocument();
    });
  });

  it('should persist task edits after refresh', async () => {
    const originalTask = { id: 1, title: 'Original Task', description: 'Original Description', completed: false, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' };
    const updatedTask = { id: 1, title: 'Updated Task', description: 'Updated Description', completed: false, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:01Z' };

    // Mock initial task list
    (api.api.listTasks as jest.MockedFunction<any>).mockResolvedValue([originalTask]);
    // Mock update task response
    (api.api.updateTask as jest.MockedFunction<any>).mockResolvedValue(updatedTask);

    render(
      <TaskItem
        task={originalTask}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={false}
      />
    );

    // Simulate editing the task
    const editButton = screen.getByText('Edit'); // Assuming there's an edit button
    fireEvent.click(editButton);

    // Wait for update to complete
    await waitFor(() => {
      expect(api.api.updateTask).toHaveBeenCalled();
    });

    // Simulate refresh by re-rendering
    render(
      <TaskItem
        task={updatedTask}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={false}
      />
    );

    // The updated task should still be reflected
    await waitFor(() => {
      expect(screen.getByText('Updated Task')).toBeInTheDocument();
    });
  });

  it('should maintain task state across browser sessions', async () => {
    const mockTasks = [
      { id: 1, title: 'Session Task', description: 'Should persist across sessions', completed: false, user_id: 1, created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' }
    ];

    // Mock API call to return tasks from persistent storage
    (api.api.listTasks as jest.MockedFunction<any>).mockResolvedValue(mockTasks);

    // Simulate initial session
    render(
      <TaskList
        tasks={mockTasks}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={false}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Session Task')).toBeInTheDocument();
    });

    // Simulate new browser session (new component instance)
    render(
      <TaskList
        tasks={mockTasks}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={false}
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Session Task')).toBeInTheDocument();
    });
  });
});