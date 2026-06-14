'use client';
import React, { useEffect } from 'react';
import { usePOS } from '@/lib/context/POSContextStore';
import { computeChange } from '@/lib/utils/cartCalculations';

export const ReceiptScreen = () => {
  const { state, dispatch } = usePOS();
  const order = state.lastCompletedOrder;

  useEffect(() => {
    // Auto-focus the new order button after a short delay
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
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 print:shadow-none">
        {/* Header */}
        <div className="text-center mb-4 border-b pb-4">
          <h1 className="text-xl font-bold">{state.activeShop?.name ?? 'POS Flow'}</h1>
          {state.activeShop?.address && <p className="text-xs text-gray-500">{state.activeShop.address}</p>}
          <p className="text-xs text-gray-400 mt-1">{new Date(order.date).toLocaleString()}</p>
          <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Customer */}
        {order.customerName && (
          <p className="text-sm text-gray-600 mb-3">Customer: <strong>{order.customerName}</strong></p>
        )}

        {/* Lines */}
        <table className="w-full text-sm mb-4">
          <tbody className="divide-y divide-gray-100">
            {lines.map((line) => (
              <tr key={line.id}>
                <td className="py-1.5">
                  <p className="font-medium">{line.productName}</p>
                  <p className="text-xs text-gray-400">
                    {line.qty} × Rp {line.price.toLocaleString()}
                    {line.discount > 0 && ` − ${line.discount}%`}
                  </p>
                </td>
                <td className="py-1.5 text-right font-medium">Rp {line.subtotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t pt-3 space-y-1 mb-4">
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>Rp {order.totalAmount.toLocaleString()}</span>
          </div>
          {payments.map((p, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-500">
              <span>{p.methodName}</span>
              <span>Rp {p.amount.toLocaleString()}</span>
            </div>
          ))}
          {change > 0 && (
            <div className="flex justify-between text-sm font-bold text-green-700 bg-green-50 rounded px-2 py-1">
              <span>Change</span>
              <span>Rp {change.toLocaleString()}</span>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mb-4">Thank you for your purchase!</p>

        {/* Actions */}
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Print
          </button>
          <button
            id="new-order-btn"
            onClick={() => dispatch({ type: 'NEW_ORDER' })}
            className="flex-1 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            New Order
          </button>
        </div>
      </div>
    </div>
  );
};
