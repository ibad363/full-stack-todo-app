import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-primary p-4">
      <LoginForm />
      <p className="mt-6 text-sm text-secondary-600">
        Don't have an account?{' '}
        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
          Sign up here
        </Link>
      </p>
      <Link href="/" className="mt-4 text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
        ← Back to home
      </Link>
    </div>
  );
}
