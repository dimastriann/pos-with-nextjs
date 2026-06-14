'use client';
import { useEffect, useState } from 'react';
import { orderRepository } from '@/repositories/orderRepository';
import { PosOrder } from '@/models/PosModels';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
        <h1 className="text-2xl font-bold text-foreground mb-1">Sales Report</h1>
        <p className="text-muted-foreground text-sm mb-6">Overview of completed transactions</p>

        {/* Range selector */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg w-fit mb-6">
          {ranges.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRange(r.value)}
              className="text-sm"
            >
              {r.label}
            </Button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-primary mt-1">Rp {totalSales.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold text-foreground mt-1">{filtered.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>{o.customerName || 'Guest'}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(o.date).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">Rp {o.totalAmount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
