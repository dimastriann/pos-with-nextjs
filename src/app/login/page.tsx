'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { adapter } from '@/adapters';
import { UserRole } from '@/models/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
    <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">POS Flow</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <p className="text-destructive text-center text-sm bg-destructive/10 p-2 rounded-lg">{error}</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={credentials.username}
                name="username"
                onChange={handleInput}
                placeholder="admin, manager, or cashier"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={credentials.password}
                type="password"
                name="password"
                onChange={handleInput}
                placeholder="Password"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p className="font-medium mb-1">Demo credentials:</p>
              <ul className="space-y-0.5">
                <li>admin / admin</li>
                <li>manager / manager</li>
                <li>cashier / cashier</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
