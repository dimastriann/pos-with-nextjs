import { CartLine, ActivePayment } from '@/models/CartModels';
import { PosOrder, PosSession, PosShop } from '@/models/PosModels';
import { Contact, PaymentMethod } from '@/models/MasterData';
import { Product } from '@/models/Product';
import { Promotion, PriceGroupItem } from '@/models/PromoModels';

export type NumpadMode = 'qty' | 'disc' | 'price';
export type POSScreen = 'pos_order' | 'payment' | 'receipt';

export interface HeldOrder {
  id: string;
  label: string;
  cartLines: CartLine[];
  customer: Contact | null;
  orderDiscount: number;
  orderNotes: string;
}

export interface POSState {
  activeSession: PosSession | null;
  activeShop: PosShop | null;
  cartLines: CartLine[];
  selectedLineIndex: number | null;
  customer: Contact | null;
  orderDiscount: number; // percentage 0-100 applied after line discounts
  orderNotes: string;
  numpadMode: NumpadMode;
  numpadInput: string;
  paymentLines: ActivePayment[];
  availablePaymentMethods: PaymentMethod[];
  currentScreen: POSScreen;
  isLoading: boolean;
  error: string | null;
  lastCompletedOrder: PosOrder | null;
  heldOrders: HeldOrder[];
  activePromotions: Promotion[];
  activePriceGroupItems: PriceGroupItem[];
}

export type POSAction =
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'REMOVE_LINE'; index: number }
  | { type: 'SELECT_LINE'; index: number | null }
  | { type: 'SET_CUSTOMER'; customer: Contact | null; priceGroupItems?: PriceGroupItem[] }
  | { type: 'SET_ORDER_DISCOUNT'; discount: number }
  | { type: 'SET_ORDER_NOTES'; notes: string }
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
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'HOLD_ORDER' }
  | { type: 'RECALL_ORDER'; id: string }
  | { type: 'DISCARD_HELD'; id: string }
  | { type: 'SET_PROMOTIONS'; promotions: Promotion[] }
  | { type: 'SET_PRICE_GROUP_ITEMS'; items: PriceGroupItem[] };
