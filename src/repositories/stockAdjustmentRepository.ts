import { adapter } from '@/adapters';
import { RESOURCE_KEYS } from '@/adapters/resourceKeys';
import { StockAdjustmentSchema } from '@/schemas/stockAdjustment.schema';
import { StockAdjustment } from '@/models/InventoryModels';
import { productRepository } from '@/repositories/productRepository';
import { generateId } from '@/lib/utils/generateId';

export const stockAdjustmentRepository = {
  getAll: (): Promise<StockAdjustment[]> =>
    adapter.getAll<StockAdjustment>(RESOURCE_KEYS.STOCK_ADJUSTMENTS),

  create: async (
    data: Omit<StockAdjustment, 'id' | 'date'>,
  ): Promise<StockAdjustment> => {
    const adjustment = StockAdjustmentSchema.parse({
      ...data,
      id: generateId(),
      date: new Date().toISOString(),
    });
    await adapter.create(RESOURCE_KEYS.STOCK_ADJUSTMENTS, adjustment);

    if (adjustment.qty > 0) {
      await productRepository.incrementStock(adjustment.productId, adjustment.qty);
    } else if (adjustment.qty < 0) {
      await productRepository.decrementStock(adjustment.productId, Math.abs(adjustment.qty));
    }

    return adjustment;
  },
};
