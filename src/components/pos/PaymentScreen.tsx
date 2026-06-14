'use client';
import React, { useState } from 'react';
import { usePOS } from '@/lib/context/POSContextStore';
import { processPayment } from '@/lib/context/posThunks';
import { computeCartTotal, computeChange } from '@/lib/utils/cartCalculations';
import { ActivePayment } from '@/models/CartModels';

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

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4">
      {/* Left: Order summary */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Order Summary</h2>
        <div className="flex-1 overflow-y-auto space-y-1 mb-4">
          {state.cartLines.map((line, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100">
              <span>{line.productName} × {line.qty}{line.discount > 0 && ` (−${line.discount}%)`}</span>
              <span className="font-medium">Rp {line.subtotal.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 space-y-1">
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-blue-700">Rp {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Paid</span>
            <span className="text-green-600 font-medium">Rp {amountPaid.toLocaleString()}</span>
          </div>
          {change > 0 ? (
            <div className="flex justify-between text-sm font-bold text-green-700 bg-green-50 rounded px-2 py-1">
              <span>Change</span>
              <span>Rp {change.toLocaleString()}</span>
            </div>
          ) : (
            <div className="flex justify-between text-sm text-red-500">
              <span>Remaining</span>
              <span>Rp {remaining.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Payment lines */}
        {state.paymentLines.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Payments</p>
            {state.paymentLines.map((p, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-0.5">
                <span>{p.methodName}</span>
                <div className="flex items-center gap-2">
                  <span>Rp {p.amount.toLocaleString()}</span>
                  <button onClick={() => dispatch({ type: 'REMOVE_PAYMENT', index: i })} className="text-red-400 hover:text-red-600 text-xs">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Payment input */}
      <div className="flex flex-col gap-3 w-full md:w-72">
        {/* Method selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Payment Method</p>
          <div className="grid grid-cols-1 gap-1.5">
            {state.availablePaymentMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethodId(m.id)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors text-left ${
                  selectedMethodId === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Amount input */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Amount</p>
          <div className="bg-gray-100 rounded-lg px-3 py-2 text-right font-mono text-lg font-bold text-gray-800 mb-2">
            {numInput || `Rp ${remaining.toLocaleString()}`}
          </div>
          <div className="grid grid-cols-3 gap-1 mb-1">
            {['1','2','3','4','5','6','7','8','9','+/-','0','.'].map((c) => (
              <button key={c} onClick={() => handleNumPress(c)} className="py-2.5 rounded text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 transition-colors">{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <button onClick={() => handleNumPress('del')} className="py-2.5 rounded text-sm font-medium bg-red-50 border border-red-200 text-red-600 hover:bg-red-100">⌫</button>
            <button onClick={handleAddPayment} disabled={!selectedMethodId} className="py-2.5 rounded text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40">Add</button>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => processPayment(state, dispatch)}
          disabled={!canPay || state.isLoading}
          className="w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {state.isLoading ? 'Processing...' : 'Pay & Print Receipt'}
        </button>
        <button
          onClick={() => dispatch({ type: 'GOTO_ORDER' })}
          className="w-full py-2.5 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Back to Order
        </button>

        {state.error && (
          <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg p-2">{state.error}</p>
        )}
      </div>
    </div>
  );
};
