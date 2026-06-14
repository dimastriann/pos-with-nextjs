'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adapter } from '@/adapters';
import { POSProvider } from '@/lib/context/POSContextStore';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    adapter.getCurrentUser().then((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthorized(true);
      }
    });
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-blue-700 text-white p-3 flex justify-between items-center font-bold text-xl">
        <span>POS Flow</span>
        <button
          onClick={async () => {
            await adapter.logout();
            router.push('/login');
          }}
          className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900"
        >
          Logout
        </button>
      </header>
      <POSProvider>{children}</POSProvider>
    </div>
  );
}
