import { Dispatch } from 'react';
import { POSAction, POSState } from '@/types/POSContext';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { orderRepository } from '@/repositories/orderRepository';
import { sessionRepository } from '@/repositories/sessionRepository';
import { productRepository } from '@/repositories/productRepository';
import { contactRepository } from '@/repositories/contactRepository';
import { PosOrder, PosOrderLine, PosPayment } from '@/models/PosModels';
import { computeOrderTotal } from '@/lib/utils/cartCalculations';

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
    const total = computeOrderTotal(state.cartLines, state.orderDiscount);

    const order: PosOrder = {
      id: orderId,
      sessionId: state.activeSession.id,
      shopId: state.activeShop?.id ?? '',
      customerId: state.customer?.id,
      customerName: state.customer?.name,
      date: now,
      totalAmount: total,
      orderDiscount: state.orderDiscount > 0 ? state.orderDiscount : undefined,
      notes: state.orderNotes || undefined,
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

    await Promise.all(
      state.cartLines.map((l) =>
        productRepository.decrementStock(l.productId, l.qty),
      ),
    );

    // Loyalty: redeem points used as payment, then earn points on full order total
    if (state.customer?.id) {
      const pointsPayment = payments.find((p) =>
        p.methodName.toLowerCase().includes('points'),
      );
      if (pointsPayment) {
        // amount is already a multiple of 1,000 (enforced in PaymentScreen)
        const pointsUsed = Math.floor(pointsPayment.amount / 1000);
        await contactRepository.redeemPoints(state.customer.id, pointsUsed);
      }
      // Earn on the full order total regardless of how it was paid
      await contactRepository.earnPoints(state.customer.id, total);

      // Refresh customer in state so the next transaction sees updated points
      const updatedCustomer = await contactRepository.getById(
        state.customer.id,
      );
      if (updatedCustomer)
        dispatch({ type: 'SET_CUSTOMER', customer: updatedCustomer });
    }

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

export async function closeSessionThunk(
  state: POSState,
  dispatch: Dispatch<POSAction>,
  router: AppRouterInstance,
): Promise<void> {
  if (!state.activeSession) return;
  dispatch({ type: 'SET_LOADING', loading: true });
  try {
    const sessionId = state.activeSession.id;
    await sessionRepository.closeSession(sessionId);
    dispatch({ type: 'SESSION_END' });
    router.push(`/pos/zreport?sessionId=${sessionId}`);
  } catch (err) {
    dispatch({ type: 'SET_ERROR', error: (err as Error).message });
  } finally {
    dispatch({ type: 'SET_LOADING', loading: false });
  }
}
