'use client';
import { useState, useEffect } from 'react';
import { PosOrderLine } from '@/models/PosModels';
import { orderRepository } from '@/repositories/orderRepository';
import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';

export default function OrderDetailsPage() {
  const [data, setData] = useState<PosOrderLine[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => setData(await orderRepository.getAllLines());

  const columns = [
    {
      header: 'Order ID',
      accessor: 'orderId' as keyof PosOrderLine,
      className: 'text-muted-foreground font-mono text-xs',
    },
    {
      header: 'Product',
      accessor: 'productName' as keyof PosOrderLine,
      className: 'font-medium',
    },
    { header: 'Qty', accessor: 'qty' as keyof PosOrderLine },
    {
      header: 'Price',
      accessor: (l: PosOrderLine) => `Rp ${l.price.toLocaleString()}`,
    },
    {
      header: 'Subtotal',
      accessor: (l: PosOrderLine) => `Rp ${l.subtotal.toLocaleString()}`,
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
