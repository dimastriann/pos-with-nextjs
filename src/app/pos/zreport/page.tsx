'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sessionRepository } from '@/repositories/sessionRepository';
import { orderRepository } from '@/repositories/orderRepository';
import { PosSession, PosOrder } from '@/models/PosModels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface PaymentSummary {
  methodName: string;
  total: number;
  count: number;
}

function ZReportContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('sessionId');

  const [session, setSession] = useState<PosSession | null>(null);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [closingFloatInput, setClosingFloatInput] = useState('');
  const [isSavingFloat, setIsSavingFloat] = useState(false);

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

  const handleSaveClosingFloat = async () => {
    if (!session) return;
    const amount = Math.max(0, parseFloat(closingFloatInput) || 0);
    setIsSavingFloat(true);
    try {
      const updated = await sessionRepository.update({
        ...session,
        closingFloat: amount,
      });
      setSession(updated);
    } finally {
      setIsSavingFloat(false);
    }
  };

  const grandTotal = orders.reduce((s, o) => s + o.totalAmount, 0);
  const duration =
    session?.endAt && session?.startAt
      ? Math.round(
          (new Date(session.endAt).getTime() -
            new Date(session.startAt).getTime()) /
            60000,
        )
      : null;

  const expectedCash =
    (session?.openingFloat ?? 0) + (session?.totalCash ?? 0);
  const hasFloat =
    session?.closingFloat !== undefined && session?.closingFloat !== null;
  const discrepancy = hasFloat
    ? (session!.closingFloat ?? 0) - expectedCash
    : null;

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
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Z-Report — End of Day</h1>
          <p className="text-muted-foreground text-sm">
            Session closed:{' '}
            {session.endAt ? new Date(session.endAt).toLocaleString() : '—'}
          </p>
        </div>

        {/* Cash Reconciliation */}
        <Card className={hasFloat && discrepancy !== null && discrepancy !== 0
          ? 'border-warning-300 dark:border-warning-500/30'
          : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cash Reconciliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Opening Float</p>
                <p className="font-semibold">
                  Rp {(session.openingFloat ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Cash Sales</p>
                <p className="font-semibold">
                  Rp {(session.totalCash ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center font-semibold border-t border-border pt-2">
              <span className="text-muted-foreground">Expected in Drawer</span>
              <span>Rp {expectedCash.toLocaleString()}</span>
            </div>

            {hasFloat ? (
              <>
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-muted-foreground">Actual Count</span>
                  <span>Rp {(session.closingFloat ?? 0).toLocaleString()}</span>
                </div>
                <div
                  className={`flex justify-between items-center font-bold rounded-lg px-3 py-2 ${
                    discrepancy === 0
                      ? 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400'
                      : 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500'
                  }`}
                >
                  <span>Discrepancy</span>
                  <span>
                    {discrepancy === 0
                      ? '✓ Balanced'
                      : `${discrepancy! > 0 ? '+' : ''}Rp ${discrepancy!.toLocaleString()}`}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-2 print:hidden">
                <p className="text-xs text-muted-foreground">
                  Count the cash in the drawer and enter the total.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={closingFloatInput}
                      onChange={(e) => setClosingFloatInput(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground [appearance:textfield] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSaveClosingFloat}
                    disabled={isSavingFloat}
                    className="shrink-0"
                  >
                    {isSavingFloat ? 'Saving…' : 'Confirm Count'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Session Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opened</span>
              <span>{new Date(session.startAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Closed</span>
              <span>
                {session.endAt ? new Date(session.endAt).toLocaleString() : '—'}
              </span>
            </div>
            {duration !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>
                  {Math.floor(duration / 60)}h {duration % 60}m
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Orders</span>
              <Badge variant="secondary">{orders.length}</Badge>
            </div>
            <div className="flex justify-between font-bold text-base text-primary">
              <span>Grand Total</span>
              <span>Rp {grandTotal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment breakdown */}
        {paymentSummary.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {paymentSummary.map((p) => (
                <div key={p.methodName} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {p.methodName}{' '}
                    <span className="text-xs">({p.count} txn)</span>
                  </span>
                  <span className="font-medium">
                    Rp {p.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Orders list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Orders ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">#</th>
                  <th className="px-4 py-2 text-left font-medium">Time</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={o.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {i + 1}
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
                      No orders in this session
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 print:hidden">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.print()}
          >
            Print Report
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push('/pos/session')}
          >
            New Session
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ZReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading report…</p>
        </div>
      }
    >
      <ZReportContent />
    </Suspense>
  );
}
