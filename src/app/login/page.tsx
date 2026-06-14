'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/pos/ControlButton';
import { AuthService } from '@/services/auth';
import { UserRole } from '@/models/User';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = AuthService.login(credentials.username, credentials.password);

    if (user) {
      switch (user.role) {
        case UserRole.Admin:
          router.push('/admin/dashboard');
          break;
        case UserRole.Manager:
          router.push('/manager/dashboard');
          break;
        case UserRole.Cashier:
          router.push('/pos/cashier');
          break;
        default:
          setError('Unknown role');
      }
    } else {
      setError('Invalid username or password');
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="h-screen flex items-center justify-center"
        onSubmit={handleLogin}
      >
        <div className="p-8 rounded-lg shadow-xl space-y-4 bg-white w-96">
          <h1 className="text-xl font-bold text-center">POS System Login</h1>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <input
            value={credentials.username}
            name="username"
            onChange={handleInput}
            placeholder="Username (admin, manager, cashier)"
            className="border rounded p-2 w-full"
          />
          <input
            value={credentials.password}
            type="password"
            name="password"
            onChange={handleInput}
            placeholder="Password"
            className="border rounded p-2 w-full"
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Login
          </Button>

          <div className="text-xs text-gray-500 mt-4">
            <p>Default credentials:</p>
            <ul className="list-disc pl-4">
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
