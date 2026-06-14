'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/pos/ControlButton';
import { adapter } from '@/adapters';
import { UserRole } from '@/models/User';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await adapter.login(credentials.username, credentials.password);

    if (result.success) {
      switch (result.user.role) {
        case UserRole.Admin:
          router.push('/admin/dashboard');
          break;
        case UserRole.Manager:
          router.push('/manager/dashboard');
          break;
        case UserRole.Cashier:
          router.push('/pos/session');
          break;
        default:
          setError('Unknown role');
      }
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="h-screen flex items-center justify-center" onSubmit={handleLogin}>
        <div className="p-8 rounded-lg shadow-xl space-y-4 bg-white w-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">POS Flow</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>
          {error && <p className="text-red-500 text-center text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={credentials.username}
              name="username"
              onChange={handleInput}
              placeholder="admin, manager, or cashier"
              className="border border-gray-300 rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              value={credentials.password}
              type="password"
              name="password"
              onChange={handleInput}
              placeholder="Password"
              className="border border-gray-300 rounded-lg p-2.5 w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <div className="text-xs text-gray-400 mt-4 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Demo credentials:</p>
            <ul className="space-y-0.5">
              <li>admin / admin</li>
              <li>manager / manager</li>
              <li>cashier / cashier</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
