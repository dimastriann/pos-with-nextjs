'use client';
import { useState, useEffect } from 'react';
import { PosOrderLine } from '@/models/PosModels';
import { storageService, STORAGE_KEYS } from '@/services/storage';
import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';

export default function OrderDetailsPage() {
  const [data, setData] = useState<PosOrderLine[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // In a real app we would join with Orders/Products
    const items = storageService.getAll<PosOrderLine>(
      STORAGE_KEYS.POS_ORDER_LINES,
    );
    setData(items);
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: 'orderId' as keyof PosOrderLine,
      className: 'text-gray-500 font-mono text-xs',
    },
    {
      header: 'Product',
      accessor: 'productName' as keyof PosOrderLine,
      className: 'font-medium text-gray-900',
    },
    { header: 'Qty', accessor: 'qty' as keyof PosOrderLine },
    {
      header: 'Price',
      accessor: (l: PosOrderLine) => `$${l.price.toFixed(2)}`,
    },
    {
      header: 'Subtotal',
      accessor: (l: PosOrderLine) => `$${l.subtotal.toFixed(2)}`,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Order Details"
        description="Granular view of all sold items."
      />

      <DataTable data={data} columns={columns} />
    </div>
  );
}
