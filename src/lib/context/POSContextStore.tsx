'use client';
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  Dispatch,
} from 'react';
import { POSState, POSAction } from '@/types/POSContext';
import { posReducer, initialPOSState } from './posReducer';
import { paymentMethodRepository } from '@/repositories/paymentMethodRepository';

interface POSContextValue {
  state: POSState;
  dispatch: Dispatch<POSAction>;
}

const POSContext = createContext<POSContextValue | null>(null);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, initialPOSState);

  useEffect(() => {
    paymentMethodRepository.getAll().then((methods) => {
      dispatch({ type: 'SET_PAYMENT_METHODS', methods });
    });
  }, []);

  return (
    <POSContext.Provider value={{ state, dispatch }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS(): POSContextValue {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error('usePOS must be used within POSProvider');
  return ctx;
}
