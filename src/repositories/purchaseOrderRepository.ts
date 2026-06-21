import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import {
  PurchaseOrderSchema,
  PurchaseOrderLineSchema,
} from '@/schemas/purchaseOrder.schema';
import { PurchaseOrder, PurchaseOrderLine } from '@/models/InventoryModels';
import { productRepository } from '@/repositories/productRepository';
import { generateId } from '@/lib/utils/generateId';

export const purchaseOrderRepository = {
  getAll: (): Promise<PurchaseOrder[]> =>
    adapter.getAll<PurchaseOrder>(RESOURCE_KEYS.PURCHASE_ORDERS),

  getById: (id: string): Promise<PurchaseOrder | null> =>
    adapter.getById<PurchaseOrder>(RESOURCE_KEYS.PURCHASE_ORDERS, id),

  getAllLines: (): Promise<PurchaseOrderLine[]> =>
    adapter.getAll<PurchaseOrderLine>(RESOURCE_KEYS.PURCHASE_ORDER_LINES),

  getLinesByOrderId: async (orderId: string): Promise<PurchaseOrderLine[]> => {
    const lines = await adapter.getAll<PurchaseOrderLine>(
      RESOURCE_KEYS.PURCHASE_ORDER_LINES,
    );
    return lines.filter((l) => l.orderId === orderId);
  },

  create: async (
    data: Omit<PurchaseOrder, 'id' | 'date' | 'status'>,
    lines: Omit<PurchaseOrderLine, 'id' | 'orderId'>[],
  ): Promise<PurchaseOrder> => {
    const order = PurchaseOrderSchema.parse({
      ...data,
      id: generateId(),
      date: new Date().toISOString(),
      status: 'Draft',
    });
    await adapter.create(RESOURCE_KEYS.PURCHASE_ORDERS, order);

    for (const line of lines) {
      const validLine = PurchaseOrderLineSchema.parse({
        ...line,
        id: generateId(),
        orderId: order.id,
      });
      await adapter.create(RESOURCE_KEYS.PURCHASE_ORDER_LINES, validLine);
    }

    return order;
  },

  confirm: async (id: string): Promise<void> => {
    const order = await adapter.getById<PurchaseOrder>(
      RESOURCE_KEYS.PURCHASE_ORDERS,
      id,
    );
    if (!order) return;
    await adapter.update(RESOURCE_KEYS.PURCHASE_ORDERS, {
      ...order,
      status: 'Confirmed',
    });
  },

  receive: async (id: string): Promise<void> => {
    const order = await adapter.getById<PurchaseOrder>(
      RESOURCE_KEYS.PURCHASE_ORDERS,
      id,
    );
    if (!order) return;

    const lines = await purchaseOrderRepository.getLinesByOrderId(id);
    for (const line of lines) {
      await productRepository.incrementStock(line.productId, line.qty);
    }

    await adapter.update(RESOURCE_KEYS.PURCHASE_ORDERS, {
      ...order,
      status: 'Received',
    });
  },

  delete: (id: string): Promise<void> =>
    adapter.delete(RESOURCE_KEYS.PURCHASE_ORDERS, id),
};
