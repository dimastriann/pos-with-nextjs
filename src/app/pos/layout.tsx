'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adapter } from '@/adapters';
import { POSProvider } from '@/lib/context/POSContextStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-2.5 flex justify-between items-center flex-shrink-0 shadow-sm">
        <span className="font-bold text-lg tracking-wide">POS Flow</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await adapter.logout();
              router.push('/login');
            }}
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Logout
          </Button>
        </div>
      </header>
      <POSProvider>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </POSProvider>
    </div>
  );
}
