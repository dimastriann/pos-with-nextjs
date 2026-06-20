import { POSState, POSAction, NumpadMode } from '@/types/POSContext';
import { CartLine } from '@/models/CartModels';
import {
  computeSubtotal,
  computeCartTotal,
} from '@/lib/utils/cartCalculations';
import { Product } from '@/models/Product';

export const initialPOSState: POSState = {
  activeSession: null,
  activeShop: null,
  cartLines: [],
  selectedLineIndex: null,
  customer: null,
  orderDiscount: 0,
  orderNotes: '',
  numpadMode: 'qty',
  numpadInput: '',
  paymentLines: [],
  availablePaymentMethods: [],
  currentScreen: 'pos_order',
  isLoading: false,
  error: null,
  lastCompletedOrder: null,
};

function applyNumpadInput(
  lines: CartLine[],
  index: number,
  mode: NumpadMode,
  input: string,
): CartLine[] {
  if (index < 0 || index >= lines.length || !input) return lines;
  const value = parseFloat(input);
  if (isNaN(value)) return lines;
  const line = { ...lines[index] };
  if (mode === 'qty') line.qty = Math.max(1, Math.floor(value));
  if (mode === 'price') line.price = Math.max(0, value);
  if (mode === 'disc') line.discount = Math.min(100, Math.max(0, value));
  line.subtotal = computeSubtotal(line.price, line.qty, line.discount);
  const updated = [...lines];
  updated[index] = line;
  return updated;
}

function addProduct(
  lines: CartLine[],
  product: Product,
): { lines: CartLine[]; selectedIndex: number } {
  const idx = lines.findIndex((l) => l.productId === product.id);
  if (idx !== -1) {
    const updated = lines.map((l, i) => {
      if (i !== idx) return l;
      const qty = l.qty + 1;
      return { ...l, qty, subtotal: computeSubtotal(l.price, qty, l.discount) };
    });
    return { lines: updated, selectedIndex: idx };
  }
  const newLine: CartLine = {
    productId: product.id,
    productName: product.name,
    price: product.price,
    qty: 1,
    discount: 0,
    subtotal: product.price,
  };
  return { lines: [...lines, newLine], selectedIndex: lines.length };
}

export function posReducer(state: POSState, action: POSAction): POSState {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const { lines, selectedIndex } = addProduct(
        state.cartLines,
        action.product,
      );
      return {
        ...state,
        cartLines: lines,
        selectedLineIndex: selectedIndex,
        numpadInput: '',
      };
    }

    case 'REMOVE_LINE': {
      const lines = state.cartLines.filter((_, i) => i !== action.index);
      const selectedLineIndex =
        lines.length === 0 ? null : Math.min(action.index, lines.length - 1);
      return { ...state, cartLines: lines, selectedLineIndex, numpadInput: '' };
    }

    case 'SELECT_LINE':
      return { ...state, selectedLineIndex: action.index, numpadInput: '' };

    case 'SET_CUSTOMER':
      return { ...state, customer: action.customer };

    case 'SET_ORDER_DISCOUNT':
      return {
        ...state,
        orderDiscount: Math.min(100, Math.max(0, action.discount)),
      };

    case 'SET_ORDER_NOTES':
      return { ...state, orderNotes: action.notes };

    case 'CLEAR_ORDER':
      return {
        ...state,
        cartLines: [],
        selectedLineIndex: null,
        customer: null,
        orderDiscount: 0,
        orderNotes: '',
        numpadInput: '',
        paymentLines: [],
      };

    case 'SET_NUMPAD_MODE': {
      // Commit current input before switching mode
      const lines =
        state.selectedLineIndex !== null
          ? applyNumpadInput(
              state.cartLines,
              state.selectedLineIndex,
              state.numpadMode,
              state.numpadInput,
            )
          : state.cartLines;
      return {
        ...state,
        numpadMode: action.mode,
        numpadInput: '',
        cartLines: lines,
      };
    }

    case 'NUMPAD_PRESS': {
      const char = action.char;

      if (char === 'del') {
        return { ...state, numpadInput: state.numpadInput.slice(0, -1) };
      }

      if (char === 'clear') {
        return { ...state, numpadInput: '' };
      }

      if (char === '+/-') {
        const toggled = state.numpadInput.startsWith('-')
          ? state.numpadInput.slice(1)
          : '-' + state.numpadInput;
        return { ...state, numpadInput: toggled };
      }

      // Prevent double decimal
      if (char === '.' && state.numpadInput.includes('.')) return state;

      const newInput = state.numpadInput + char;

      // Commit immediately to the selected line for live feedback
      const lines =
        state.selectedLineIndex !== null
          ? applyNumpadInput(
              state.cartLines,
              state.selectedLineIndex,
              state.numpadMode,
              newInput,
            )
          : state.cartLines;

      return { ...state, numpadInput: newInput, cartLines: lines };
    }

    case 'ADD_PAYMENT': {
      const total = computeCartTotal(state.cartLines);
      const alreadyPaid = state.paymentLines.reduce((s, p) => s + p.amount, 0);
      const remaining = Math.max(0, total - alreadyPaid);
      const payment = {
        ...action.payment,
        amount: Math.min(action.payment.amount, remaining + 0.001),
      };
      return { ...state, paymentLines: [...state.paymentLines, payment] };
    }

    case 'REMOVE_PAYMENT':
      return {
        ...state,
        paymentLines: state.paymentLines.filter((_, i) => i !== action.index),
      };

    case 'GOTO_PAYMENT':
      if (state.cartLines.length === 0) return state;
      return {
        ...state,
        currentScreen: 'payment',
        paymentLines: [],
        numpadInput: '',
      };

    case 'GOTO_ORDER':
      return { ...state, currentScreen: 'pos_order', paymentLines: [] };

    case 'GOTO_RECEIPT':
      return {
        ...state,
        currentScreen: 'receipt',
        lastCompletedOrder: action.order,
        cartLines: [],
        paymentLines: [],
        customer: null,
        orderDiscount: 0,
        orderNotes: '',
        selectedLineIndex: null,
        numpadInput: '',
      };

    case 'NEW_ORDER':
      return { ...state, currentScreen: 'pos_order', lastCompletedOrder: null };

    case 'SESSION_START':
      return {
        ...state,
        activeSession: action.session,
        activeShop: action.shop,
      };

    case 'SESSION_END':
      return { ...state, activeSession: null, activeShop: null };

    case 'SET_PAYMENT_METHODS':
      return { ...state, availablePaymentMethods: action.methods };

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    default:
      return state;
  }
}
