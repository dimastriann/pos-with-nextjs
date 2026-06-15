import { Dispatch } from 'react';
import { POSAction, POSState } from '@/types/POSContext';
import { orderRepository } from '@/repositories/orderRepository';
import { sessionRepository } from '@/repositories/sessionRepository';
import { PosOrder, PosOrderLine, PosPayment } from '@/models/PosModels';
import { computeCartTotal } from '@/lib/utils/cartCalculations';
import { generateId } from '@/lib/utils/generateId';

export async function processPayment(
  state: POSState,
  dispatch: Dispatch<POSAction>,
): Promise<void> {
  if (!state.activeSession) {
    dispatch({
      type: 'SET_ERROR',
      error: 'No active session. Please open a session first.',
    });
    return;
  }

  dispatch({ type: 'SET_LOADING', loading: true });

  try {
    const orderId = generateId();
    const now = new Date().toISOString();
    const total = computeCartTotal(state.cartLines);

    const order: PosOrder = {
      id: orderId,
      sessionId: state.activeSession.id,
      shopId: state.activeShop?.id ?? '',
      customerId: state.customer?.id,
      customerName: state.customer?.name,
      date: now,
      totalAmount: total,
      status: 'Paid',
    };

    const lines: PosOrderLine[] = state.cartLines.map((l) => ({
      id: generateId(),
      orderId,
      productId: l.productId,
      productName: l.productName,
      qty: l.qty,
      price: l.price,
      discount: l.discount,
      subtotal: l.subtotal,
    }));

    const payments: PosPayment[] = state.paymentLines.map((p) => ({
      id: generateId(),
      orderId,
      methodId: p.methodId,
      methodName: p.methodName,
      amount: p.amount,
      date: now,
    }));

    await orderRepository.createWithLines(order, lines, payments);

    const cashPaid = payments
      .filter((p) => p.methodName.toLowerCase().includes('cash'))
      .reduce((s, p) => s + p.amount, 0);

    await sessionRepository.incrementTotals(state.activeSession.id, {
      totalOrders: 1,
      totalCash: cashPaid,
    });

    dispatch({
      type: 'GOTO_RECEIPT',
      order: { ...order, lines, payments },
    });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', error: (err as Error).message });
  } finally {
    dispatch({ type: 'SET_LOADING', loading: false });
  }
}
