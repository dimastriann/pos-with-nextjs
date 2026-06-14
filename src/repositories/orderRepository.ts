import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { OrderSchema, OrderLineSchema, PaymentRecordSchema } from '@/schemas/order.schema';
import { PosOrder, PosOrderLine, PosPayment } from '@/models/PosModels';

export const orderRepository = {
  getAll: (): Promise<PosOrder[]> =>
    adapter.getAll<PosOrder>(RESOURCE_KEYS.ORDERS),

  getById: (id: string): Promise<PosOrder | null> =>
    adapter.getById<PosOrder>(RESOURCE_KEYS.ORDERS, id),

  update: (data: PosOrder): Promise<PosOrder> => {
    const order = OrderSchema.parse(data);
    return adapter.update(RESOURCE_KEYS.ORDERS, order);
  },

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.ORDERS, id),

  getAllLines: (): Promise<PosOrderLine[]> =>
    adapter.getAll<PosOrderLine>(RESOURCE_KEYS.ORDER_LINES),

  getLinesByOrderId: async (orderId: string): Promise<PosOrderLine[]> => {
    const lines = await adapter.getAll<PosOrderLine>(RESOURCE_KEYS.ORDER_LINES);
    return lines.filter((l) => l.orderId === orderId);
  },

  getAllPayments: (): Promise<PosPayment[]> =>
    adapter.getAll<PosPayment>(RESOURCE_KEYS.PAYMENTS),

  getPaymentsByOrderId: async (orderId: string): Promise<PosPayment[]> => {
    const payments = await adapter.getAll<PosPayment>(RESOURCE_KEYS.PAYMENTS);
    return payments.filter((p) => p.orderId === orderId);
  },

  createWithLines: async (
    order: PosOrder,
    lines: PosOrderLine[],
    payments: PosPayment[],
  ): Promise<PosOrder> => {
    const validOrder = OrderSchema.parse(order);
    const validLines = lines.map((l) => OrderLineSchema.parse(l));
    const validPayments = payments.map((p) => PaymentRecordSchema.parse(p));

    await adapter.create(RESOURCE_KEYS.ORDERS, validOrder);

    for (const line of validLines) {
      await adapter.create(RESOURCE_KEYS.ORDER_LINES, line);
    }

    for (const payment of validPayments) {
      await adapter.create(RESOURCE_KEYS.PAYMENTS, payment);
    }

    return validOrder;
  },
};
