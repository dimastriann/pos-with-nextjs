'use client';
import { useEffect, useState } from 'react';
import { orderRepository } from '@/repositories/orderRepository';
import { PosOrder } from '@/models/PosModels';

type Range = 'today' | 'week' | 'month' | 'all';

function filterByRange(orders: PosOrder[], range: Range): PosOrder[] {
  const now = new Date();
  return orders.filter((o) => {
    const d = new Date(o.date);
    if (range === 'today') return d.toDateString() === now.toDateString();
    if (range === 'week') return now.getTime() - d.getTime() <= 7 * 86400000;
    if (range === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });
}

export default function ReportPage() {
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [range, setRange] = useState<Range>('today');

  useEffect(() => {
    orderRepository.getAll().then(setOrders);
  }, []);

  const filtered = filterByRange(orders.filter((o) => o.status === 'Paid'), range);
  const totalSales = filtered.reduce((s, o) => s + o.totalAmount, 0);

  const ranges: { label: string; value: Range }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sales Report</h1>
        <p className="text-gray-500 text-sm mb-6">Overview of completed transactions</p>

        {/* Range selector */}
        <div className="bg-gray-100 p-1 rounded-lg flex gap-1 w-fit mb-6">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${range === r.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">Rp {totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{filtered.length}</p>
          </div>
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">No orders found</td></tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">{o.customerName || 'Guest'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(o.date).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium">Rp {o.totalAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
