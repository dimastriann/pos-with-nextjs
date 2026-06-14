'use client';
import { useState, useEffect } from 'react';
import { PosPayment } from '@/models/PosModels';
import { storageService, STORAGE_KEYS } from '@/services/storage';
import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';

export default function PaymentsPage() {
  const [data, setData] = useState<PosPayment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = storageService.getAll<PosPayment>(STORAGE_KEYS.POS_PAYMENTS);
    setData(items);
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: 'orderId' as keyof PosPayment,
      className: 'text-gray-500 font-mono text-xs',
    },
    {
      header: 'Method',
      accessor: 'methodName' as keyof PosPayment,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Amount',
      accessor: (p: PosPayment) => `$${p.amount.toFixed(2)}`,
    },
    {
      header: 'Date',
      accessor: (p: PosPayment) => new Date(p.date).toLocaleString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Log of all received payments."
      />

      <DataTable data={data} columns={columns} />
    </div>
  );
}
