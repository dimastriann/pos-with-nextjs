import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { SessionSchema } from '@/schemas/session.schema';
import { PosSession } from '@/models/PosModels';
import { generateId } from '@/lib/utils/generateId';

export const sessionRepository = {
  getAll: (): Promise<PosSession[]> =>
    adapter.getAll<PosSession>(RESOURCE_KEYS.SESSIONS),

  getById: (id: string): Promise<PosSession | null> =>
    adapter.getById<PosSession>(RESOURCE_KEYS.SESSIONS, id),

  create: (data: Omit<PosSession, 'id'>): Promise<PosSession> => {
    const session = SessionSchema.parse({ ...data, id: generateId() });
    return adapter.create(RESOURCE_KEYS.SESSIONS, session);
  },

  update: (data: PosSession): Promise<PosSession> => {
    const session = SessionSchema.parse(data);
    return adapter.update(RESOURCE_KEYS.SESSIONS, session);
  },

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.SESSIONS, id),

  getOpenSessionForShop: async (shopId: string): Promise<PosSession | null> => {
    const sessions = await adapter.getAll<PosSession>(RESOURCE_KEYS.SESSIONS);
    return (
      sessions.find((s) => s.shopId === shopId && s.status === 'Open') ?? null
    );
  },

  closeSession: async (id: string): Promise<PosSession> => {
    const session = await adapter.getById<PosSession>(RESOURCE_KEYS.SESSIONS, id);
    if (!session) throw new Error('Session not found');
    return adapter.update(RESOURCE_KEYS.SESSIONS, {
      ...session,
      status: 'Closed',
      endAt: new Date().toISOString(),
    });
  },

  incrementTotals: async (
    id: string,
    delta: { totalOrders: number; totalCash: number },
  ): Promise<void> => {
    const session = await adapter.getById<PosSession>(
      RESOURCE_KEYS.SESSIONS,
      id,
    );
    if (!session) return;
    await adapter.update(RESOURCE_KEYS.SESSIONS, {
      ...session,
      totalOrders: session.totalOrders + delta.totalOrders,
      totalCash: session.totalCash + delta.totalCash,
    });
  },
};
