'use client';
import { usePOS } from '@/lib/context/POSContextStore';
import { PosOrderScreen } from '@/components/pos/PosOrderScreen';
import { PaymentScreen } from '@/components/pos/PaymentScreen';
import { ReceiptScreen } from '@/components/pos/ReceiptScreen';

export default function POSPage() {
  const { state } = usePOS();

  if (state.currentScreen === 'payment') return <PaymentScreen />;
  if (state.currentScreen === 'receipt') return <ReceiptScreen />;
  return <PosOrderScreen />;
}
