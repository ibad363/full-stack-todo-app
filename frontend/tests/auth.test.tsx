import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../src/components/auth/LoginForm';
import { AuthProvider } from '../src/components/auth/AuthProvider';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock API
jest.mock('../src/lib/api', () => ({
  api: {
    login: jest.fn(),
    isAuthenticated: jest.fn(() => false),
  },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders correctly', () => {
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    // Check heading
    expect(screen.getByRole('heading', { level: 2, name: 'Login' })).toBeInTheDocument();
    // Check inputs
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('calls login and redirects on success', async () => {
    const { api } = require('../src/lib/api');
    api.login.mockResolvedValue({ access_token: 'test-token' });

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
