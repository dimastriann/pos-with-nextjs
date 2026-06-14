import { CartLine, ActivePayment } from '@/models/CartModels';
import { PosOrder, PosSession, PosShop } from '@/models/PosModels';
import { Contact, PaymentMethod } from '@/models/MasterData';
import { Product } from '@/models/Product';

export type NumpadMode = 'qty' | 'disc' | 'price';
export type POSScreen = 'pos_order' | 'payment' | 'receipt';

export interface POSState {
  activeSession: PosSession | null;
  activeShop: PosShop | null;
  cartLines: CartLine[];
  selectedLineIndex: number | null;
  customer: Contact | null;
  numpadMode: NumpadMode;
  numpadInput: string;
  paymentLines: ActivePayment[];
  availablePaymentMethods: PaymentMethod[];
  currentScreen: POSScreen;
  isLoading: boolean;
  error: string | null;
  lastCompletedOrder: PosOrder | null;
}

export type POSAction =
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'REMOVE_LINE'; index: number }
  | { type: 'SELECT_LINE'; index: number | null }
  | { type: 'SET_CUSTOMER'; customer: Contact | null }
  | { type: 'CLEAR_ORDER' }
  | { type: 'NUMPAD_PRESS'; char: string }
  | { type: 'SET_NUMPAD_MODE'; mode: NumpadMode }
  | { type: 'ADD_PAYMENT'; payment: ActivePayment }
  | { type: 'REMOVE_PAYMENT'; index: number }
  | { type: 'GOTO_PAYMENT' }
  | { type: 'GOTO_ORDER' }
  | { type: 'GOTO_RECEIPT'; order: PosOrder }
  | { type: 'NEW_ORDER' }
  | { type: 'SESSION_START'; session: PosSession; shop: PosShop }
  | { type: 'SESSION_END' }
  | { type: 'SET_PAYMENT_METHODS'; methods: PaymentMethod[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null };
