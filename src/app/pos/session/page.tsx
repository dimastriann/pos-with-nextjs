'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adapter } from '@/adapters';
import { sessionRepository } from '@/repositories/sessionRepository';
import { shopRepository } from '@/repositories/shopRepository';
import { usePOS } from '@/lib/context/POSContextStore';
import { PosSession, PosShop } from '@/models/PosModels';
import { User } from '@/models/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SessionGatePage() {
  const router = useRouter();
  const { dispatch } = usePOS();
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<PosShop | null>(null);
  const [openSession, setOpenSession] = useState<PosSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('0');

  useEffect(() => {
    const load = async () => {
      const currentUser = await adapter.getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      if (currentUser.shopId) {
        const [userShop, existingSession] = await Promise.all([
          shopRepository.getById(currentUser.shopId),
          sessionRepository.getOpenSessionForShop(currentUser.shopId),
        ]);
        setShop(userShop);
        setOpenSession(existingSession);
      }
      setIsLoading(false);
    };
    load();
  }, [router]);

  const handleOpenSession = async () => {
    if (!user || !shop) return;
    setIsOpening(true);
    try {
      const float = Math.max(0, parseFloat(openingFloat) || 0);
      const session = await sessionRepository.create({
        shopId: shop.id,
        userId: user.id,
        startAt: new Date().toISOString(),
        status: 'Open',
        totalOrders: 0,
        totalCash: 0,
        openingFloat: float,
      });
      dispatch({ type: 'SESSION_START', session, shop });
      router.push('/pos');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsOpening(false);
    }
  };

  const handleResumeSession = () => {
    if (!openSession || !shop) return;
    dispatch({ type: 'SESSION_START', session: openSession, shop });
    router.push('/pos');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-3 w-72">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
              🏪
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Cash Register
            </h1>
            {shop && (
              <p className="text-muted-foreground text-sm mt-1">{shop.name}</p>
            )}
            {user && (
              <p className="text-muted-foreground/70 text-xs mt-0.5">
                Logged in as {user.name}
              </p>
            )}
          </div>

          {!user?.shopId ? (
            <p className="text-destructive text-center text-sm bg-destructive/10 p-4 rounded-lg">
              Your account is not assigned to a shop. Contact your admin.
            </p>
          ) : openSession ? (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm">
                <p className="font-medium text-green-800 dark:text-green-400">
                  Open session found
                </p>
                <p className="text-green-600 dark:text-green-500 text-xs mt-1">
                  Started: {new Date(openSession.startAt).toLocaleString()}
                </p>
                <p className="text-green-600 dark:text-green-500 text-xs">
                  Orders: {openSession.totalOrders}
                </p>
                {(openSession.openingFloat ?? 0) > 0 && (
                  <p className="text-green-600 dark:text-green-500 text-xs">
                    Opening float: Rp{' '}
                    {(openSession.openingFloat ?? 0).toLocaleString()}
                  </p>
                )}
              </div>
              <Button
                onClick={handleResumeSession}
                className="w-full h-11 font-bold"
              >
                Resume Session
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenSession}
                disabled={isOpening}
                className="w-full"
              >
                Open New Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground text-sm">
                No open session. Start a new one to begin selling.
              </p>

              {/* Opening Cash Float */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Opening Cash Float
                </label>
                <p className="text-xs text-muted-foreground">
                  Enter the amount of cash currently in the drawer.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={openingFloat}
                    onChange={(e) => setOpeningFloat(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground [appearance:textfield] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <Button
                onClick={handleOpenSession}
                disabled={isOpening}
                className="w-full h-11 font-bold"
              >
                {isOpening ? 'Opening...' : 'Open Cash Register'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
