import { posReducer, initialPOSState } from '@/lib/context/posReducer';
import { POSState } from '@/types/POSContext';
import { Product } from '@/models/Product';
import { CartLine } from '@/models/CartModels';
import { PosOrder, PosSession, PosShop } from '@/models/PosModels';
import { PaymentMethod } from '@/models/MasterData';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'prod-1',
  name: 'Coffee',
  price: 15000,
  stock: 50,
  ...overrides,
});

const makeCartLine = (overrides: Partial<CartLine> = {}): CartLine => ({
  productId: 'prod-1',
  productName: 'Coffee',
  price: 15000,
  qty: 1,
  discount: 0,
  subtotal: 15000,
  ...overrides,
});

const makeSession = (): PosSession => ({
  id: 'sess-1',
  shopId: 'shop-1',
  userId: 'user-1',
  startAt: '2025-01-01T08:00:00.000Z',
  status: 'Open',
  totalOrders: 0,
  totalCash: 0,
});

const makeShop = (): PosShop => ({
  id: 'shop-1',
  name: 'Main Store',
  active: true,
});

const stateWithCart = (): POSState => ({
  ...initialPOSState,
  cartLines: [makeCartLine()],
  selectedLineIndex: 0,
});

describe('posReducer — ADD_PRODUCT', () => {
  it('adds a new product as a cart line with qty=1', () => {
    const product = makeProduct();
    const state = posReducer(initialPOSState, { type: 'ADD_PRODUCT', product });
    expect(state.cartLines).toHaveLength(1);
    expect(state.cartLines[0].productId).toBe('prod-1');
    expect(state.cartLines[0].qty).toBe(1);
    expect(state.cartLines[0].subtotal).toBe(15000);
    expect(state.selectedLineIndex).toBe(0);
  });

  it('increments qty when the same product is added again', () => {
    const product = makeProduct();
    const s1 = posReducer(initialPOSState, { type: 'ADD_PRODUCT', product });
    const s2 = posReducer(s1, { type: 'ADD_PRODUCT', product });
    expect(s2.cartLines).toHaveLength(1);
    expect(s2.cartLines[0].qty).toBe(2);
    expect(s2.cartLines[0].subtotal).toBe(30000);
  });

  it('adds a second distinct product as a new line', () => {
    const s1 = posReducer(initialPOSState, {
      type: 'ADD_PRODUCT',
      product: makeProduct(),
    });
    const s2 = posReducer(s1, {
      type: 'ADD_PRODUCT',
      product: makeProduct({ id: 'prod-2', name: 'Tea', price: 8000 }),
    });
    expect(s2.cartLines).toHaveLength(2);
    expect(s2.selectedLineIndex).toBe(1);
  });

  it('clears numpadInput when adding a product', () => {
    const state: POSState = { ...initialPOSState, numpadInput: '5' };
    const next = posReducer(state, {
      type: 'ADD_PRODUCT',
      product: makeProduct(),
    });
    expect(next.numpadInput).toBe('');
  });
});

describe('posReducer — REMOVE_LINE', () => {
  it('removes the line at the given index', () => {
    const s = stateWithCart();
    const next = posReducer(s, { type: 'REMOVE_LINE', index: 0 });
    expect(next.cartLines).toHaveLength(0);
    expect(next.selectedLineIndex).toBeNull();
  });

  it('clamps selectedLineIndex after removal', () => {
    const s: POSState = {
      ...initialPOSState,
      cartLines: [
        makeCartLine({ productId: 'a' }),
        makeCartLine({ productId: 'b' }),
      ],
      selectedLineIndex: 1,
    };
    const next = posReducer(s, { type: 'REMOVE_LINE', index: 1 });
    expect(next.cartLines).toHaveLength(1);
    expect(next.selectedLineIndex).toBe(0);
  });
});

describe('posReducer — SELECT_LINE', () => {
  it('updates selectedLineIndex and clears numpadInput', () => {
    const s: POSState = {
      ...initialPOSState,
      numpadInput: '3',
      selectedLineIndex: null,
    };
    const next = posReducer(s, { type: 'SELECT_LINE', index: 0 });
    expect(next.selectedLineIndex).toBe(0);
    expect(next.numpadInput).toBe('');
  });
});

describe('posReducer — SET_CUSTOMER / CLEAR_ORDER', () => {
  it('SET_CUSTOMER sets the customer', () => {
    const customer = { id: 'c1', name: 'Alice', type: 'Customer' as const };
    const next = posReducer(initialPOSState, {
      type: 'SET_CUSTOMER',
      customer,
    });
    expect(next.customer).toEqual(customer);
  });

  it('CLEAR_ORDER resets cart and customer', () => {
    const s: POSState = {
      ...initialPOSState,
      cartLines: [makeCartLine()],
      customer: { id: 'c1', name: 'Alice', type: 'Customer' },
      paymentLines: [{ methodId: 'm1', methodName: 'Cash', amount: 15000 }],
    };
    const next = posReducer(s, { type: 'CLEAR_ORDER' });
    expect(next.cartLines).toHaveLength(0);
    expect(next.customer).toBeNull();
    expect(next.paymentLines).toHaveLength(0);
    expect(next.numpadInput).toBe('');
  });
});

describe('posReducer — NUMPAD_PRESS', () => {
  it('appends digits to numpadInput', () => {
    let s = posReducer(initialPOSState, { type: 'NUMPAD_PRESS', char: '1' });
    s = posReducer(s, { type: 'NUMPAD_PRESS', char: '2' });
    s = posReducer(s, { type: 'NUMPAD_PRESS', char: '3' });
    expect(s.numpadInput).toBe('123');
  });

  it('del removes last character', () => {
    const s: POSState = { ...initialPOSState, numpadInput: '123' };
    const next = posReducer(s, { type: 'NUMPAD_PRESS', char: 'del' });
    expect(next.numpadInput).toBe('12');
  });

  it('clear empties the input', () => {
    const s: POSState = { ...initialPOSState, numpadInput: '999' };
    const next = posReducer(s, { type: 'NUMPAD_PRESS', char: 'clear' });
    expect(next.numpadInput).toBe('');
  });

  it('appends decimal point', () => {
    const s: POSState = { ...initialPOSState, numpadInput: '10' };
    const next = posReducer(s, { type: 'NUMPAD_PRESS', char: '.' });
    expect(next.numpadInput).toBe('10.');
  });

  it('prevents duplicate decimal point', () => {
    const s: POSState = { ...initialPOSState, numpadInput: '10.' };
    const next = posReducer(s, { type: 'NUMPAD_PRESS', char: '.' });
    expect(next.numpadInput).toBe('10.');
  });

  it('live-updates cart line qty when a line is selected', () => {
    const s: POSState = {
      ...initialPOSState,
      cartLines: [makeCartLine({ price: 15000, qty: 1, subtotal: 15000 })],
      selectedLineIndex: 0,
      numpadMode: 'qty',
    };
    const next = posReducer(s, { type: 'NUMPAD_PRESS', char: '3' });
    expect(next.cartLines[0].qty).toBe(3);
    expect(next.cartLines[0].subtotal).toBe(45000);
  });
});

describe('posReducer — SET_NUMPAD_MODE', () => {
  it('commits pending numpadInput before switching modes', () => {
    const s: POSState = {
      ...initialPOSState,
      cartLines: [makeCartLine({ price: 15000, qty: 1, subtotal: 15000 })],
      selectedLineIndex: 0,
      numpadMode: 'qty',
      numpadInput: '5',
    };
    const next = posReducer(s, { type: 'SET_NUMPAD_MODE', mode: 'disc' });
    expect(next.cartLines[0].qty).toBe(5);
    expect(next.numpadMode).toBe('disc');
    expect(next.numpadInput).toBe('');
  });
});

describe('posReducer — ADD_PAYMENT / REMOVE_PAYMENT', () => {
  const cartState: POSState = {
    ...initialPOSState,
    cartLines: [makeCartLine({ subtotal: 15000 })],
    currentScreen: 'payment',
  };

  it('adds a payment to paymentLines', () => {
    const next = posReducer(cartState, {
      type: 'ADD_PAYMENT',
      payment: { methodId: 'm1', methodName: 'Cash', amount: 15000 },
    });
    expect(next.paymentLines).toHaveLength(1);
    expect(next.paymentLines[0].amount).toBe(15000);
  });

  it('caps payment amount at remaining balance', () => {
    const next = posReducer(cartState, {
      type: 'ADD_PAYMENT',
      payment: { methodId: 'm1', methodName: 'Cash', amount: 999999 },
    });
    expect(next.paymentLines[0].amount).toBeLessThanOrEqual(15001);
  });

  it('removes a payment by index', () => {
    const s: POSState = {
      ...cartState,
      paymentLines: [
        { methodId: 'm1', methodName: 'Cash', amount: 10000 },
        { methodId: 'm2', methodName: 'Debit', amount: 5000 },
      ],
    };
    const next = posReducer(s, { type: 'REMOVE_PAYMENT', index: 0 });
    expect(next.paymentLines).toHaveLength(1);
    expect(next.paymentLines[0].methodId).toBe('m2');
  });
});

describe('posReducer — GOTO_PAYMENT / GOTO_ORDER', () => {
  it('GOTO_PAYMENT is blocked on an empty cart', () => {
    const next = posReducer(initialPOSState, { type: 'GOTO_PAYMENT' });
    expect(next.currentScreen).toBe('pos_order');
  });

  it('GOTO_PAYMENT transitions to payment screen when cart has items', () => {
    const next = posReducer(stateWithCart(), { type: 'GOTO_PAYMENT' });
    expect(next.currentScreen).toBe('payment');
    expect(next.paymentLines).toHaveLength(0);
  });

  it('GOTO_ORDER returns to pos_order screen', () => {
    const s: POSState = { ...initialPOSState, currentScreen: 'payment' };
    const next = posReducer(s, { type: 'GOTO_ORDER' });
    expect(next.currentScreen).toBe('pos_order');
  });
});

describe('posReducer — GOTO_RECEIPT / NEW_ORDER', () => {
  const completedOrder: PosOrder = {
    id: 'ord-1',
    sessionId: 'sess-1',
    shopId: 'shop-1',
    date: '2025-01-01T09:00:00.000Z',
    totalAmount: 15000,
    status: 'Paid',
  };

  it('GOTO_RECEIPT stores order, clears cart, goes to receipt screen', () => {
    const s = stateWithCart();
    const next = posReducer(s, { type: 'GOTO_RECEIPT', order: completedOrder });
    expect(next.currentScreen).toBe('receipt');
    expect(next.lastCompletedOrder).toEqual(completedOrder);
    expect(next.cartLines).toHaveLength(0);
    expect(next.paymentLines).toHaveLength(0);
    expect(next.customer).toBeNull();
  });

  it('NEW_ORDER returns to pos_order and clears lastCompletedOrder', () => {
    const s: POSState = {
      ...initialPOSState,
      currentScreen: 'receipt',
      lastCompletedOrder: completedOrder,
    };
    const next = posReducer(s, { type: 'NEW_ORDER' });
    expect(next.currentScreen).toBe('pos_order');
    expect(next.lastCompletedOrder).toBeNull();
  });
});

describe('posReducer — SESSION_START / SESSION_END', () => {
  it('SESSION_START sets active session and shop', () => {
    const session = makeSession();
    const shop = makeShop();
    const next = posReducer(initialPOSState, {
      type: 'SESSION_START',
      session,
      shop,
    });
    expect(next.activeSession).toEqual(session);
    expect(next.activeShop).toEqual(shop);
  });

  it('SESSION_END clears session and shop', () => {
    const s: POSState = {
      ...initialPOSState,
      activeSession: makeSession(),
      activeShop: makeShop(),
    };
    const next = posReducer(s, { type: 'SESSION_END' });
    expect(next.activeSession).toBeNull();
    expect(next.activeShop).toBeNull();
  });
});

describe('posReducer — SET_PAYMENT_METHODS / SET_LOADING / SET_ERROR', () => {
  it('SET_PAYMENT_METHODS sets the available payment methods', () => {
    const methods: PaymentMethod[] = [
      { id: 'm1', name: 'Cash', type: 'Cash' },
      { id: 'm2', name: 'Debit', type: 'Bank' },
    ];
    const next = posReducer(initialPOSState, {
      type: 'SET_PAYMENT_METHODS',
      methods,
    });
    expect(next.availablePaymentMethods).toEqual(methods);
  });

  it('SET_LOADING toggles the loading flag', () => {
    const s1 = posReducer(initialPOSState, {
      type: 'SET_LOADING',
      loading: true,
    });
    expect(s1.isLoading).toBe(true);
    const s2 = posReducer(s1, { type: 'SET_LOADING', loading: false });
    expect(s2.isLoading).toBe(false);
  });

  it('SET_ERROR sets an error message', () => {
    const next = posReducer(initialPOSState, {
      type: 'SET_ERROR',
      error: 'Something went wrong',
    });
    expect(next.error).toBe('Something went wrong');
  });

  it('SET_ERROR with null clears the error', () => {
    const s: POSState = { ...initialPOSState, error: 'Previous error' };
    const next = posReducer(s, { type: 'SET_ERROR', error: null });
    expect(next.error).toBeNull();
  });
});
