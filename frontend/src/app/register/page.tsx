import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-primary p-4">
      <RegisterForm />
      <p className="mt-6 text-sm text-secondary-600">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
          Sign in here
        </Link>
      </p>
      <Link href="/" className="mt-4 text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
        ← Back to home
      </Link>
    </div>
  );
}
