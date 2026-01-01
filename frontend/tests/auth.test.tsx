import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../src/components/auth/LoginForm';
import { AuthProvider } from '../src/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock API
jest.mock('../src/lib/api', () => ({
  api: {
    login: jest.fn(),
    isAuthenticated: jest.fn(() => false),
  },
}));

describe('LoginForm', () => {
  it('renders correctly', () => {
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.fn()).mockReturnValue(mockRouter);

    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('calls login and redirects on success', async () => {
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.fn()).mockReturnValue(mockRouter);

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
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });
});
