'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-3 flex justify-between items-center font-bold text-xl">
        <span>MyPOS Flow App</span>
        <button
          onClick={() => {
            AuthService.logout();
            router.push('/login');
          }}
          className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900"
        >
          Logout
        </button>
      </header>
      {children}
    </div>
  );
}
