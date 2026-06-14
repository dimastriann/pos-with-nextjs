'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePOS } from '@/lib/context/POSContextStore';
import { processPayment } from '@/lib/context/posThunks';
import { computeCartTotal, computeChange } from '@/lib/utils/cartCalculations';
import { ActivePayment } from '@/models/CartModels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentScreen = () => {
  const { state, dispatch } = usePOS();
  const [numInput, setNumInput] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  const total = computeCartTotal(state.cartLines);
  const amountPaid = state.paymentLines.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, total - amountPaid);
  const change = computeChange(total, amountPaid);
  const canPay = amountPaid >= total && state.cartLines.length > 0;

  const handleAddPayment = () => {
    const method = state.availablePaymentMethods.find((m) => m.id === selectedMethodId);
    if (!method) return;
    const amount = numInput ? parseFloat(numInput) : remaining;
    if (!amount || amount <= 0) return;
    const payment: ActivePayment = { methodId: method.id, methodName: method.name, amount };
    dispatch({ type: 'ADD_PAYMENT', payment });
    setNumInput('');
  };

  const handleNumPress = (char: string) => {
    if (char === 'del') { setNumInput((p) => p.slice(0, -1)); return; }
    if (char === '.' && numInput.includes('.')) return;
    setNumInput((p) => p + char);
  };

  const DIGITS = ['1','2','3','4','5','6','7','8','9','+/-','0','.'];

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4">
      {/* Left: Order summary */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
          <div className="flex-1 overflow-y-auto space-y-1 mb-4">
            {state.cartLines.map((line, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border">
                <span className="text-foreground">
                  {line.productName} × {line.qty}
                  {line.discount > 0 && <span className="text-muted-foreground"> (−{line.discount}%)</span>}
                </span>
                <span className="font-medium">Rp {line.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">Rp {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Paid</span>
              <span className="text-green-600 dark:text-green-400 font-medium">Rp {amountPaid.toLocaleString()}</span>
            </div>
            {change > 0 ? (
              <div className="flex justify-between text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded px-2 py-1.5">
                <span>Change</span>
                <span>Rp {change.toLocaleString()}</span>
              </div>
            ) : remaining > 0 ? (
              <div className="flex justify-between text-sm text-destructive bg-destructive/5 rounded px-2 py-1.5">
                <span>Remaining</span>
                <span>Rp {remaining.toLocaleString()}</span>
              </div>
            ) : null}
          </div>

          {/* Payment lines */}
          {state.paymentLines.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Payments Applied</p>
              {state.paymentLines.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1">
                  <span>{p.methodName}</span>
                  <div className="flex items-center gap-2">
                    <span>Rp {p.amount.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => dispatch({ type: 'REMOVE_PAYMENT', index: i })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Payment input */}
      <div className="flex flex-col gap-3 w-full md:w-72">
        {/* Method selector */}
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Payment Method</p>
            <div className="grid grid-cols-1 gap-1.5">
              {state.availablePaymentMethods.map((m) => (
                <Button
                  key={m.id}
                  variant={selectedMethodId === m.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedMethodId(m.id)}
                >
                  {m.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amount numpad */}
        <Card>
          <CardContent className="p-3">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Amount</p>
            <div className="bg-muted rounded-lg px-3 py-2 text-right font-mono text-lg font-bold text-foreground mb-2 min-h-[44px]">
              {numInput || `Rp ${remaining.toLocaleString()}`}
            </div>
            <div className="grid grid-cols-3 gap-1 mb-1">
              {DIGITS.map((c) => (
                <Button key={c} variant="outline" onClick={() => handleNumPress(c)} className="h-10 text-sm font-medium">
                  {c}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <Button variant="outline" onClick={() => handleNumPress('del')} className="h-10 text-destructive border-destructive/30 hover:bg-destructive/10">
                ⌫
              </Button>
              <Button onClick={handleAddPayment} disabled={!selectedMethodId} className="h-10">
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Button
          onClick={() => processPayment(state, dispatch)}
          disabled={!canPay || state.isLoading}
          className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white"
        >
          {state.isLoading ? 'Processing...' : 'Pay & Print Receipt'}
        </Button>
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'GOTO_ORDER' })}
          className="w-full"
        >
          Back to Order
        </Button>

        {state.error && (
          <p className="text-destructive text-sm text-center bg-destructive/10 rounded-lg p-2">{state.error}</p>
        )}
      </div>
    </div>
  );
};
