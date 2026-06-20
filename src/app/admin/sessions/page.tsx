'use client';
import { useState, useEffect } from 'react';
import { PosSession } from '@/models/PosModels';
import { sessionRepository } from '@/repositories/sessionRepository';
import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';

export default function SessionsPage() {
  const [data, setData] = useState<PosSession[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => setData(await sessionRepository.getAll());

  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof PosSession,
      className: 'font-mono text-xs text-muted-foreground',
    },
    { header: 'Shop ID', accessor: 'shopId' as keyof PosSession },
    { header: 'User ID', accessor: 'userId' as keyof PosSession },
    {
      header: 'Start Time',
      accessor: (s: PosSession) => new Date(s.startAt).toLocaleString(),
    },
    {
      header: 'Status',
      accessor: (s: PosSession) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            s.status === 'Open'
              ? 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {s.status}
        </span>
      ),
    },
    { header: 'Total Orders', accessor: 'totalOrders' as keyof PosSession },
    {
      header: 'Cash',
      accessor: (s: PosSession) => `Rp ${s.totalCash.toLocaleString()}`,
    },
  ];

  return (
    <div>
      <PageHeader
        title="POS Sessions"
        description="View cash register history."
      />
      <DataTable data={data} columns={columns} />
    </div>
  );
}
