'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass w-full max-w-lg p-12 animate-scale-in rounded-[3rem] border-primary-500/10 shadow-premium relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

      <div className="text-center mb-10 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow mx-auto mb-6">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <h2 className="text-4xl font-bold font-display text-secondary-900 dark:text-white mb-3">Welcome Back</h2>
        <p className="text-lg text-secondary-500 dark:text-white/40">Enter your credentials to access your tasks.</p>
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

        <Input
          label="Secure Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
          className="rounded-2xl py-4"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-8 h-auto bg-primary-500 hover:bg-primary-600 text-white shadow-glow hover:shadow-premium transition-all duration-500 rounded-2xl font-bold text-xl mt-4"
        >
          {isLoading ? 'Authenticating...' : 'Sign In to AuraTask'}
        </Button>
      </form>
    </div>
  );
}
