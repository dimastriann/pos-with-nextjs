'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adapter } from '@/adapters';
import { sessionRepository } from '@/repositories/sessionRepository';
import { shopRepository } from '@/repositories/shopRepository';
import { usePOS } from '@/lib/context/POSContextStore';
import { PosSession, PosShop } from '@/models/PosModels';
import { User } from '@/models/User';

export default function SessionGatePage() {
  const router = useRouter();
  const { dispatch } = usePOS();
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<PosShop | null>(null);
  const [openSession, setOpenSession] = useState<PosSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const load = async () => {
      const currentUser = await adapter.getCurrentUser();
      if (!currentUser) { router.push('/login'); return; }
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
      const session = await sessionRepository.create({
        shopId: shop.id,
        userId: user.id,
        startAt: new Date().toISOString(),
        status: 'Open',
        totalOrders: 0,
        totalCash: 0,
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
        <div className="animate-pulse text-gray-400">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Register</h1>
          {shop && <p className="text-gray-500 text-sm mt-1">{shop.name}</p>}
          {user && <p className="text-gray-400 text-xs mt-0.5">Logged in as {user.name}</p>}
        </div>

        {!user?.shopId ? (
          <div className="text-center text-red-500 text-sm bg-red-50 p-4 rounded-lg">
            Your account is not assigned to a shop. Contact your admin.
          </div>
        ) : openSession ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-green-800">Open session found</p>
              <p className="text-green-600 text-xs mt-1">
                Started: {new Date(openSession.startAt).toLocaleString()}
              </p>
              <p className="text-green-600 text-xs">Orders: {openSession.totalOrders}</p>
            </div>
            <button
              onClick={handleResumeSession}
              className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Resume Session
            </button>
            <button
              onClick={handleOpenSession}
              disabled={isOpening}
              className="w-full py-2.5 rounded-xl font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Open New Session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-gray-500 text-sm">No open session. Start a new one to begin selling.</p>
            <button
              onClick={handleOpenSession}
              disabled={isOpening}
              className="w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isOpening ? 'Opening...' : 'Open Cash Register'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
