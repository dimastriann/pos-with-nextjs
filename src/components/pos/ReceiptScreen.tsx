'use client';
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { usePOS } from '@/lib/context/POSContextStore';
import { computeChange } from '@/lib/utils/cartCalculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const ReceiptScreen = () => {
  const { state, dispatch } = usePOS();
  const order = state.lastCompletedOrder;

  useEffect(() => {
    const t = setTimeout(() => {
      document.getElementById('new-order-btn')?.focus();
    }, 300);
    return () => clearTimeout(t);
  }, []);

  if (!order) return null;

  const lines = order.lines ?? [];
  const payments = order.payments ?? [];
  const amountPaid = payments.reduce((s, p) => s + p.amount, 0);
  const change = computeChange(order.totalAmount, amountPaid);

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-sm"
      >
        <Card className="print:shadow-none">
          <CardContent className="p-6">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold text-foreground">
                {state.activeShop?.name ?? 'POS Flow'}
              </h1>
              {state.activeShop?.address && (
                <p className="text-xs text-muted-foreground">
                  {state.activeShop.address}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(order.date).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <Separator className="mb-4" />

            {/* Customer */}
            {order.customerName && (
              <p className="text-sm text-muted-foreground mb-3">
                Customer:{' '}
                <strong className="text-foreground">
                  {order.customerName}
                </strong>
              </p>
            )}

            {/* Lines */}
            <table className="w-full text-sm mb-4">
              <tbody className="divide-y divide-border">
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="py-1.5">
                      <p className="font-medium text-foreground">
                        {line.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {line.qty} × Rp {line.price.toLocaleString()}
                        {line.discount > 0 && ` − ${line.discount}%`}
                      </p>
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      Rp {line.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="mb-3" />

            {/* Totals */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>Rp {order.totalAmount.toLocaleString()}</span>
              </div>
              {payments.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm text-muted-foreground"
                >
                  <span>{p.methodName}</span>
                  <span>Rp {p.amount.toLocaleString()}</span>
                </div>
              ))}
              {change > 0 && (
                <div className="flex justify-between text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded px-2 py-1.5">
                  <span>Change</span>
                  <span>Rp {change.toLocaleString()}</span>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground mb-4">
              Thank you for your purchase!
            </p>

            {/* Actions */}
            <div className="flex gap-2 print:hidden">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button
                id="new-order-btn"
                className="flex-1"
                onClick={() => dispatch({ type: 'NEW_ORDER' })}
              >
                New Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
