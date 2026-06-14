'use client';
import { useState, useEffect } from 'react';
import { PosSession } from '@/models/PosModels';
import { storageService, STORAGE_KEYS } from '@/services/storage';
import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';

export default function SessionsPage() {
  const [data, setData] = useState<PosSession[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // In a real app we would join with User and Shop tables to get names
    const items = storageService.getAll<PosSession>(STORAGE_KEYS.POS_SESSIONS);
    setData(items);
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id' as keyof PosSession,
      className: 'font-mono text-xs text-gray-500',
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
          className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
        >
          {s.status}
        </span>
      ),
    },
    { header: 'Total Orders', accessor: 'totalOrders' as keyof PosSession },
    {
      header: 'Cash',
      accessor: (s: PosSession) => `$${s.totalCash.toFixed(2)}`,
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
