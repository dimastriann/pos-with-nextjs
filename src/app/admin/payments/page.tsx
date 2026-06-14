'use client';
import { useState, useEffect } from 'react';
import { PosPayment } from '@/models/PosModels';
import { orderRepository } from '@/repositories/orderRepository';
import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';

export default function PaymentsPage() {
  const [data, setData] = useState<PosPayment[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => setData(await orderRepository.getAllPayments());

  const columns = [
    { header: 'Order ID', accessor: 'orderId' as keyof PosPayment, className: 'text-muted-foreground font-mono text-xs' },
    { header: 'Method', accessor: 'methodName' as keyof PosPayment, className: 'font-medium' },
    { header: 'Amount', accessor: (p: PosPayment) => `Rp ${p.amount.toLocaleString()}` },
    { header: 'Date', accessor: (p: PosPayment) => new Date(p.date).toLocaleString() },
  ];

  return (
    <div>
      <PageHeader title="Payments" description="Log of all received payments." />
      <DataTable data={data} columns={columns} />
    </div>
  );
}
