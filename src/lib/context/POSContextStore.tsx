import { createContext, useContext } from 'react';

import { POSContextState, defaultPOSContext } from '@/types/POSContext';

const POSContext = createContext<POSContextState | undefined>(undefined);
export const usePos = () => useContext(POSContext);

export default function POS_Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = {
    currentOrder: {},
    currentOrderLine: [],
    customer: {},
    addProduct: () => undefined,
    updateQty: () => undefined,
    removeLine: () => undefined,
    setCustomer: () => undefined,
    clearOrder: () => undefined,
    getTotal: () => 0,
    OrderList: [],
  };
  return (
    <>
      <POSContext.Provider value={store}>{children}</POSContext.Provider>
    </>
  );
}
