import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { PaymentMethod } from '@/models/MasterData';
import { generateId } from '@/lib/utils/generateId';

export const paymentMethodRepository = {
  getAll: (): Promise<PaymentMethod[]> =>
    adapter.getAll<PaymentMethod>(RESOURCE_KEYS.PAYMENT_METHODS),

  getById: (id: string): Promise<PaymentMethod | null> =>
    adapter.getById<PaymentMethod>(RESOURCE_KEYS.PAYMENT_METHODS, id),

  create: (data: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> =>
    adapter.create(RESOURCE_KEYS.PAYMENT_METHODS, {
      ...data,
      id: generateId(),
    }),

  update: (data: PaymentMethod): Promise<PaymentMethod> =>
    adapter.update(RESOURCE_KEYS.PAYMENT_METHODS, data),

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.PAYMENT_METHODS, id),
};
