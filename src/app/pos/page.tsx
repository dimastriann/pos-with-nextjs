'use client';
import { AnimatePresence, motion } from 'motion/react';
import { usePOS } from '@/lib/context/POSContextStore';
import { PosOrderScreen } from '@/components/pos/PosOrderScreen';
import { PaymentScreen } from '@/components/pos/PaymentScreen';
import { ReceiptScreen } from '@/components/pos/ReceiptScreen';

export default function POSPage() {
  const { state } = usePOS();

  return (
    <AnimatePresence mode="wait">
      {state.currentScreen === 'payment' ? (
        <motion.div
          key="payment"
          className="flex flex-col flex-1 overflow-hidden h-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.18 }}
        >
          <PaymentScreen />
        </motion.div>
      ) : state.currentScreen === 'receipt' ? (
        <motion.div
          key="receipt"
          className="flex flex-col flex-1 overflow-hidden h-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.18 }}
        >
          <ReceiptScreen />
        </motion.div>
      ) : (
        <motion.div
          key="pos_order"
          className="flex flex-col flex-1 overflow-hidden h-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.18 }}
        >
          <PosOrderScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
