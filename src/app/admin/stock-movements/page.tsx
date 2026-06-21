'use client';
import { useState, useEffect, useMemo } from 'react';
import { orderRepository } from '@/repositories/orderRepository';
import { stockAdjustmentRepository } from '@/repositories/stockAdjustmentRepository';
import { purchaseOrderRepository } from '@/repositories/purchaseOrderRepository';
import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'Sale' | 'Adjustment' | 'PO Receipt';
  qty: number;
  reference: string;
}

type MovementType = 'All' | 'Sale' | 'Adjustment' | 'PO Receipt';

function TypeBadge({ type }: { type: StockMovement['type'] }) {
  const cls: Record<StockMovement['type'], string> = {
    Sale: 'bg-error-50 text-error-600 dark:bg-error-500/[0.12] dark:text-error-400',
    Adjustment: 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400',
    'PO Receipt': 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls[type]}`}>
      {type}
    </span>
  );
}

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType>('All');

  useEffect(() => {
    const load = async () => {
      const [allOrders, allLines, adjustments, purchaseOrders, poLines] =
        await Promise.all([
          orderRepository.getAll(),
          orderRepository.getAllLines(),
          stockAdjustmentRepository.getAll(),
          purchaseOrderRepository.getAll(),
          purchaseOrderRepository.getAllLines(),
        ]);

      const paidOrderIds = new Set(
        allOrders.filter((o) => o.status === 'Paid').map((o) => o.id),
      );
      const orderMap = new Map(allOrders.map((o) => [o.id, o]));

      // Sales: each PosOrderLine from a Paid order → stock OUT
      const saleMovements: StockMovement[] = allLines
        .filter((line) => paidOrderIds.has(line.orderId))
        .map((line) => {
          const order = orderMap.get(line.orderId);
          return {
            id: `sale-${line.id}`,
            date: order?.date ?? new Date().toISOString(),
            productId: line.productId,
            productName: line.productName,
            type: 'Sale',
            qty: -line.qty,
            reference: `Order #${line.orderId.slice(0, 8).toUpperCase()}`,
          };
        });

      // Adjustments
      const adjustmentMovements: StockMovement[] = adjustments.map((adj) => ({
        id: `adj-${adj.id}`,
        date: adj.date,
        productId: adj.productId,
        productName: adj.productName,
        type: 'Adjustment',
        qty: adj.qty,
        reference: adj.reason,
      }));

      // PO Receipts: PO lines from Received POs → stock IN
      const receivedPoIds = new Set(
        purchaseOrders.filter((po) => po.status === 'Received').map((po) => po.id),
      );
      const poMap = new Map(purchaseOrders.map((po) => [po.id, po]));

      const poReceiptMovements: StockMovement[] = poLines
        .filter((line) => receivedPoIds.has(line.orderId))
        .map((line) => {
          const po = poMap.get(line.orderId);
          return {
            id: `po-${line.id}`,
            date: po?.date ?? new Date().toISOString(),
            productId: line.productId,
            productName: line.productName,
            type: 'PO Receipt',
            qty: line.qty,
            reference: `PO #${line.orderId.slice(0, 8).toUpperCase()}`,
          };
        });

      const all = [...saleMovements, ...adjustmentMovements, ...poReceiptMovements].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      setMovements(all);
      setIsLoading(false);
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        search.trim() === '' ||
        m.productName.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'All' || m.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [movements, search, typeFilter]);

  const columns = [
    {
      header: 'Date / Time',
      accessor: (m: StockMovement) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(m.date).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(m.date).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      header: 'Product',
      accessor: (m: StockMovement) => (
        <p className="font-medium text-gray-800 dark:text-white/90">
          {m.productName}
        </p>
      ),
    },
    {
      header: 'Type',
      accessor: (m: StockMovement) => <TypeBadge type={m.type} />,
    },
    {
      header: 'Qty Change',
      accessor: (m: StockMovement) => (
        <span
          className={`font-bold tabular-nums ${
            m.qty > 0
              ? 'text-success-600 dark:text-success-400'
              : 'text-error-600 dark:text-error-400'
          }`}
        >
          {m.qty > 0 ? `+${m.qty}` : m.qty}
        </span>
      ),
    },
    {
      header: 'Reference',
      accessor: (m: StockMovement) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {m.reference}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Movement History"
        description="Complete log of all stock changes across sales, adjustments, and purchase orders."
      />

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Search product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as MovementType)}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Sale">Sale</SelectItem>
            <SelectItem value="Adjustment">Adjustment</SelectItem>
            <SelectItem value="PO Receipt">PO Receipt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-12 text-center">
          Loading movements…
        </p>
      ) : (
        <DataTable data={filtered} columns={columns} />
      )}
    </div>
  );
}
