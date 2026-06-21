'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { sessionRepository } from '@/repositories/sessionRepository';
import { orderRepository } from '@/repositories/orderRepository';
import { PosSession, PosOrder } from '@/models/PosModels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PaymentSummary {
  methodName: string;
  total: number;
  count: number;
}

function XReportContent() {
  const params = useSearchParams();
  const sessionId = params.get('sessionId');

  const [session, setSession] = useState<PosSession | null>(null);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      const [sess, allOrders, allPayments] = await Promise.all([
        sessionRepository.getById(sessionId),
        orderRepository.getAll(),
        orderRepository.getAllPayments(),
      ]);
      if (!sess) return;
      setSession(sess);

      const sessionOrders = allOrders.filter(
        (o) => o.sessionId === sessionId && o.status === 'Paid',
      );
      setOrders(sessionOrders);

      const orderIds = new Set(sessionOrders.map((o) => o.id));
      const sessionPayments = allPayments.filter((p) =>
        orderIds.has(p.orderId),
      );

      const summary = sessionPayments.reduce<Record<string, PaymentSummary>>(
        (acc, p) => {
          if (!acc[p.methodName]) {
            acc[p.methodName] = {
              methodName: p.methodName,
              total: 0,
              count: 0,
            };
          }
          acc[p.methodName].total += p.amount;
          acc[p.methodName].count += 1;
          return acc;
        },
        {},
      );
      setPaymentSummary(Object.values(summary));
      setIsLoading(false);
    };
    load();
  }, [sessionId]);

  const grandTotal = orders.reduce((s, o) => s + o.totalAmount, 0);

  const durationMinutes = (() => {
    if (!session) return null;
    const start = new Date(session.startAt).getTime();
    const end = session.endAt ? new Date(session.endAt).getTime() : Date.now();
    return Math.round((end - start) / 60000);
  })();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading report…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Session not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-muted/20">
      <div className="max-w-2xl mx-auto space-y-4" id="receipt-print">

        {/* Header row */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/pos"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </div>

        {/* Title + badge */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400">
            Mid-Shift Snapshot
          </span>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            X-Report (Mid-Shift Snapshot)
          </h1>
          <p className="text-muted-foreground text-sm">
            Generated: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Session Info card */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shop ID</span>
              <span className="font-medium">{session.shopId || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opened at</span>
              <span>{new Date(session.startAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  session.status === 'Open'
                    ? 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-white/[0.05] dark:text-gray-400'
                }`}
              >
                {session.status}
              </span>
            </div>
            {durationMinutes !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration so far</span>
                <span>
                  {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary cards row */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-2xl">
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-[#465fff]">{orders.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="pt-5 pb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-[#465fff]">
                Rp {grandTotal.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment breakdown */}
        {paymentSummary.length > 0 && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-4 py-2 text-left font-medium">Method</th>
                    <th className="px-4 py-2 text-center font-medium">Count</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSummary.map((p) => (
                    <tr key={p.methodName} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-medium">{p.methodName}</td>
                      <td className="px-4 py-2 text-center text-muted-foreground">
                        {p.count}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        Rp {p.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center font-bold text-[#465fff] px-4 py-3 border-t border-border">
                <span>Grand Total</span>
                <span>Rp {grandTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders list */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Order #</th>
                  <th className="px-4 py-2 text-left font-medium">Time</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {new Date(o.date).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      Rp {o.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No paid orders in this session yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Separator className="print:hidden" />

        {/* Print action */}
        <div className="flex justify-center print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function XReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading report…</p>
        </div>
      }
    >
      <XReportContent />
    </Suspense>
  );
}
