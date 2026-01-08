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
    <div className="glass w-full max-w-lg p-12 animate-scale-in rounded-[3rem] border-primary-500/10 shadow-premium relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

      <div className="text-center mb-10 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow mx-auto mb-6">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <h2 className="text-4xl font-bold font-display text-secondary-900 dark:text-white mb-3">Create Account</h2>
        <p className="text-lg text-secondary-500 dark:text-white/40">Join AuraTask and start mastering your day.</p>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl animate-slide-down">
          <p className="text-sm font-medium text-red-500 flex items-center">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isLoading}
          className="rounded-2xl py-4"
        />

        <div>
          <Input
            label="Strong Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            disabled={isLoading}
            className="rounded-2xl py-4"
          />

          {/* Password strength indicator */}
          {password && (
            <div className="mt-4 animate-slide-down bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary-400">Strength</span>
                <span className="text-xs font-bold text-primary-500">{passwordStrength.label}</span>
              </div>
              <div className="h-1.5 bg-secondary-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${passwordStrength.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Secure Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
          className="rounded-2xl py-4"
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-8 h-auto bg-primary-500 hover:bg-primary-600 text-white shadow-glow hover:shadow-premium transition-all duration-500 rounded-2xl font-bold text-xl mt-4"
        >
          {isLoading ? 'Creating Account...' : 'Get Started with AuraTask'}
        </Button>
      </form>
    </div>
  );
}
