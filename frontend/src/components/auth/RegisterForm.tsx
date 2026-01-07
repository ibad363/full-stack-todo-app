'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['bg-danger-500', 'bg-orange-500', 'bg-yellow-500', 'bg-success-500', 'bg-success-600'];

    return {
      strength: (strength / 5) * 100,
      label: labels[Math.min(strength - 1, 4)] || 'Weak',
      color: colors[Math.min(strength - 1, 4)] || 'bg-danger-500',
    };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await register(email, password);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 animate-scale-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-secondary-900 mb-2">Create Account</h2>
        <p className="text-secondary-600">Get started with your free account</p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={isLoading}
        />

        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
            minLength={8}
            disabled={isLoading}
            helperText="Minimum 8 characters"
          />

          {/* Password strength indicator */}
          {password && (
            <div className="mt-2 animate-slide-down">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-secondary-600">Password strength:</span>
                <span className="text-xs font-medium text-secondary-700">{passwordStrength.label}</span>
              </div>
              <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          disabled={isLoading}
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full mt-6"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </Card>
  );
}
