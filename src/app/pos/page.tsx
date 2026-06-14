'use client';

import { PosOrderScreen } from '@/components/pos/PosOrderScreen';

export default function POSPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Products */}
      <div className="w-auto flex flex-col border-r">
        <PosOrderScreen />
      </div>

      {/* Right: Order + Controls */}
      {/* <div className="w-2/5 flex flex-col"> */}
      {/* <CustomerButton />
        <OrderLines />
        <div className="flex">
          <Numpad />
          <PaymentSection />
        </div> */}
      {/* </div> */}
    </div>
  );
}
