'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adapter } from '@/adapters';
import { POSProvider, usePOS } from '@/lib/context/POSContextStore';
import { closeSessionThunk } from '@/lib/context/posThunks';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function POSHeader() {
  const router = useRouter();
  const { state, dispatch } = usePOS();

  const handleEndDay = async () => {
    if (!state.activeSession) return;
    if (!window.confirm('Close the register and generate Z-report?')) return;
    await closeSessionThunk(state, dispatch, router);
  };

  return (
    <header className="bg-primary text-primary-foreground px-4 py-2.5 flex justify-between items-center flex-shrink-0 shadow-sm">
      <span className="font-bold text-lg tracking-wide">POS Flow</span>
      <div className="flex items-center gap-2">
        {state.activeSession && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/pos/xreport?sessionId=${state.activeSession!.id}`)}
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-xs"
          >
            X-Report
          </Button>
        )}
        {state.activeSession && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndDay}
            disabled={state.isLoading}
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-xs"
          >
            End Day
          </Button>
        )}
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
  );
}

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    adapter.getCurrentUser().then((user) => {
      if (!user) router.push('/login');
      else setIsAuthorized(true);
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
      <POSProvider>
        <POSHeader />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </POSProvider>
    </div>
  );
}
