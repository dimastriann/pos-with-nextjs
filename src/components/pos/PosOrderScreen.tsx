'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingCart, ScanBarcode, X, PauseCircle, UserPlus } from 'lucide-react';
import Numpad from '@/components/pos/Numpad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePOS } from '@/lib/context/POSContextStore';
import { productRepository } from '@/repositories/productRepository';
import { categoryRepository } from '@/repositories/categoryRepository';
import { contactRepository } from '@/repositories/contactRepository';
import { useBarcodeScanner } from '@/lib/hooks/useBarcodeScanner';
import { Product } from '@/models/Product';
import { Category, Contact } from '@/models/MasterData';
import { computeOrderTotal } from '@/lib/utils/cartCalculations';
import { HeldOrder } from '@/types/POSContext';

export function PosOrderScreen() {
  const { state, dispatch } = usePOS();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  const [scanFeedback, setScanFeedback] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  useEffect(() => {
    Promise.all([
      productRepository.getAll(),
      categoryRepository.getAll(),
      contactRepository.getAll(),
    ]).then(([prods, cats, contacts]) => {
      setProducts(prods);
      setCategories(cats);
      setCustomers(contacts.filter((c) => c.type === 'Customer'));
    });
  }, []);

  const handleScan = useCallback(
    async (barcode: string) => {
      const product = await productRepository.getByBarcode(barcode);
      if (product) {
        dispatch({ type: 'ADD_PRODUCT', product });
        setMobileTab('cart');
        setScanFeedback({ text: `✓ ${product.name}`, ok: true });
      } else {
        setScanFeedback({ text: `Not found: ${barcode}`, ok: false });
      }
      setTimeout(() => setScanFeedback(null), 2000);
    },
    [dispatch],
  );

  useBarcodeScanner(handleScan);

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) return;
    setIsSavingCustomer(true);
    try {
      const contact = await contactRepository.create({
        name: newCustomerName.trim(),
        type: 'Customer',
        phone: newCustomerPhone.trim() || undefined,
        loyaltyPoints: 0,
      });
      setCustomers((prev) => [...prev, contact]);
      dispatch({ type: 'SET_CUSTOMER', customer: contact });
      setShowCustomerSearch(false);
      setShowNewCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (p.active === false) return false;
    const matchCat =
      activeCategoryId === 'all' || p.categoryId === activeCategoryId;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const total = computeOrderTotal(state.cartLines, state.orderDiscount);
  const [discountInput, setDiscountInput] = useState('');
  const cartCount = state.cartLines.reduce((s, l) => s + l.qty, 0);

  const scanBanner = scanFeedback && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-2 flex-shrink-0 ${
        scanFeedback.ok
          ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
          : 'bg-destructive/10 text-destructive border border-destructive/20'
      }`}
    >
      <ScanBarcode className="h-4 w-4 flex-shrink-0" />
      {scanFeedback.text}
    </motion.div>
  );

  const productPanel = (
    <div className="flex flex-col overflow-hidden h-full">
      <AnimatePresence>{scanBanner}</AnimatePresence>

      {/* Barcode scan row */}
      <form
        className="flex gap-2 mb-2 flex-shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          const code = manualBarcode.trim();
          if (code) {
            handleScan(code);
            setManualBarcode('');
          }
        }}
      >
        <div className="relative flex-1">
          <ScanBarcode className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Scan or type barcode…"
            className="pl-8"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!manualBarcode.trim()}
        >
          Scan
        </Button>
      </form>

      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products…"
        className="mb-2 flex-shrink-0"
      />
      {/* Category tabs */}
      <div className="flex gap-1 mb-2 overflow-x-auto pb-1 flex-shrink-0">
        <Button
          size="sm"
          variant={activeCategoryId === 'all' ? 'default' : 'ghost'}
          onClick={() => setActiveCategoryId('all')}
          className="rounded-full text-xs whitespace-nowrap"
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={activeCategoryId === c.id ? 'default' : 'ghost'}
            onClick={() => setActiveCategoryId(c.id)}
            className="rounded-full text-xs whitespace-nowrap"
          >
            {c.name}
          </Button>
        ))}
      </div>
      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto flex-1">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
          >
            <Card
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full overflow-hidden"
              onClick={() => {
                dispatch({ type: 'ADD_PRODUCT', product });
                setMobileTab('cart');
              }}
            >
              {product.image && (
                <div className="h-20 w-full bg-muted overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (
                        e.currentTarget.parentElement as HTMLElement
                      ).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardContent className="p-3">
                <p className="font-semibold text-sm leading-tight text-card-foreground">
                  {product.name}
                </p>
                {product.sku && (
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                )}
                <p className="text-primary font-bold text-sm mt-1">
                  Rp {product.price.toLocaleString()}
                </p>
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-orange-600 bg-orange-50 text-xs mt-1"
                  >
                    Low: {product.stock}
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge variant="destructive" className="text-xs mt-1">
                    Out of stock
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-2 sm:col-span-3 text-center py-12 text-muted-foreground text-sm">
            No products found
          </div>
        )}
      </div>
    </div>
  );

  const cartPanel = (
    <div className="flex flex-col overflow-hidden h-full">
      {/* Hold / Recall row */}
      <div className="flex gap-1.5 mb-2 flex-shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="text-xs flex-1 gap-1"
          disabled={state.cartLines.length === 0}
          onClick={() => dispatch({ type: 'HOLD_ORDER' })}
        >
          <PauseCircle className="h-3.5 w-3.5" />
          Hold
        </Button>
        {state.heldOrders.length > 0 && (
          <Button
            size="sm"
            variant="secondary"
            className="text-xs gap-1"
            onClick={() => setShowHeldOrders(true)}
          >
            Held
            <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-warning-500 text-white text-xs font-bold">
              {state.heldOrders.length}
            </span>
          </Button>
        )}
      </div>

      {/* Customer selector */}
      <div className="mb-2 flex-shrink-0">
        {showCustomerSearch ? (
          <div className="border border-border rounded-lg p-2 bg-card space-y-1.5">
            {showNewCustomer ? (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <UserPlus className="h-3.5 w-3.5" /> New Customer
                </p>
                <Input
                  autoFocus
                  placeholder="Name *"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="h-7 text-sm"
                />
                <Input
                  placeholder="Phone (optional)"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="h-7 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomer()}
                />
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="flex-1 h-6 text-xs"
                    disabled={!newCustomerName.trim() || isSavingCustomer}
                    onClick={handleCreateCustomer}
                  >
                    {isSavingCustomer ? 'Saving…' : 'Save & Select'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={() => setShowNewCustomer(false)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Input
                  autoFocus
                  placeholder="Search customer…"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="h-7 text-sm"
                />
                <div className="max-h-32 overflow-y-auto space-y-0.5">
                  {customers
                    .filter((c) =>
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()),
                    )
                    .slice(0, 8)
                    .map((c) => (
                      <button
                        key={c.id}
                        className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent transition-colors flex justify-between items-center"
                        onClick={() => {
                          dispatch({ type: 'SET_CUSTOMER', customer: c });
                          setShowCustomerSearch(false);
                          setCustomerSearch('');
                        }}
                      >
                        <span>{c.name}</span>
                        {(c.loyaltyPoints ?? 0) > 0 && (
                          <span className="text-xs text-primary font-medium">
                            {c.loyaltyPoints} pts
                          </span>
                        )}
                      </button>
                    ))}
                  {customers.filter((c) =>
                    c.name.toLowerCase().includes(customerSearch.toLowerCase()),
                  ).length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-1">
                      No customers found
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-6 text-xs gap-1"
                    onClick={() => {
                      setShowNewCustomer(true);
                      setNewCustomerName(customerSearch);
                    }}
                  >
                    <UserPlus className="h-3 w-3" /> New Customer
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={() => setShowCustomerSearch(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {state.customer && (
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                {state.customer.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <Button
              variant={state.customer ? 'secondary' : 'default'}
              className="flex-1 text-sm h-8"
              onClick={() => setShowCustomerSearch(true)}
            >
              {state.customer ? state.customer.name : '+ Add Customer'}
            </Button>
            {state.customer && (
              <button
                className="text-muted-foreground hover:text-destructive transition-colors"
                onClick={() =>
                  dispatch({ type: 'SET_CUSTOMER', customer: null })
                }
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {state.customer && (state.customer.loyaltyPoints ?? 0) > 0 && (
          <p className="text-xs text-primary mt-1 px-1">
            {state.customer.loyaltyPoints} pts available (Rp{' '}
            {((state.customer.loyaltyPoints ?? 0) * 1000).toLocaleString()}{' '}
            value)
          </p>
        )}
      </div>

      {/* Order lines */}
      <div className="flex-1 overflow-y-auto space-y-1 mb-2 min-h-0">
        {state.cartLines.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            Cart is empty
          </p>
        )}
        <AnimatePresence initial={false}>
          {state.cartLines.map((line, index) => (
            <motion.div
              key={`${line.productId}-${index}`}
              initial={{ opacity: 0, x: 24, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -24, height: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => dispatch({ type: 'SELECT_LINE', index })}
              className={`relative p-2 rounded-lg border cursor-pointer transition-colors ${
                state.selectedLineIndex === index
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex justify-between items-start pr-5">
                <div>
                  <p className="font-semibold text-sm leading-tight">
                    {line.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {line.qty} × Rp {line.price.toLocaleString()}
                    {line.discount > 0 && ` − ${line.discount}%`}
                  </p>
                </div>
                <p className="font-bold text-sm">
                  Rp {line.subtotal.toLocaleString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'REMOVE_LINE', index });
                }}
                className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Total */}
      <div className="border-t border-border pt-2 mb-1 flex-shrink-0">
        {state.orderDiscount > 0 && (
          <div className="flex justify-between items-center text-xs text-green-700 dark:text-green-400 mb-0.5">
            <span>Disc {state.orderDiscount}%</span>
            <span>
              −Rp{' '}
              {(computeOrderTotal(state.cartLines, 0) - total).toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-base">
          <span>Total</span>
          <span className="text-primary">Rp {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Numpad */}
      <div className="flex-shrink-0">
        <Numpad
          mode={state.numpadMode}
          inputValue={state.numpadInput}
          onPress={(char) => dispatch({ type: 'NUMPAD_PRESS', char })}
          onModeChange={(mode) => dispatch({ type: 'SET_NUMPAD_MODE', mode })}
          onPayment={() => dispatch({ type: 'GOTO_PAYMENT' })}
          canPay={state.cartLines.length > 0}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop layout (md+): side by side ── */}
      <div className="hidden md:grid grid-cols-12 gap-3 p-3 flex-1 overflow-hidden">
        {/* Product grid */}
        <div className="col-span-7 flex flex-col overflow-hidden">
          {productPanel}
        </div>

        {/* Control buttons */}
        <div className="col-span-1 flex flex-col gap-1.5 pt-8">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => dispatch({ type: 'CLEAR_ORDER' })}
          >
            Clear
          </Button>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground text-center">
              Note
            </span>
            <textarea
              rows={2}
              value={state.orderNotes}
              onChange={(e) =>
                dispatch({ type: 'SET_ORDER_NOTES', notes: e.target.value })
              }
              placeholder="…"
              className="w-full text-xs border border-border rounded px-1 py-0.5 bg-background text-foreground resize-none"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <Button
              size="sm"
              variant={state.orderDiscount > 0 ? 'default' : 'outline'}
              className="text-xs"
              onClick={() => {
                const v = parseFloat(discountInput);
                if (!isNaN(v) && v >= 0 && v <= 100) {
                  dispatch({ type: 'SET_ORDER_DISCOUNT', discount: v });
                  setDiscountInput('');
                }
              }}
            >
              {state.orderDiscount > 0
                ? `Disc ${state.orderDiscount}%`
                : 'Disc %'}
            </Button>
            <input
              type="number"
              min={0}
              max={100}
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="%"
              className="w-full text-xs text-center border border-border rounded px-1 py-0.5 bg-background text-foreground [appearance:textfield]"
            />
            {state.orderDiscount > 0 && (
              <button
                className="text-xs text-destructive underline"
                onClick={() =>
                  dispatch({ type: 'SET_ORDER_DISCOUNT', discount: 0 })
                }
              >
                clear
              </button>
            )}
          </div>
        </div>

        {/* Order panel */}
        <div className="col-span-4 border-l border-border pl-3 flex flex-col overflow-hidden">
          {cartPanel}
        </div>
      </div>

      {/* ── Mobile layout (<md): tab-based ── */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border bg-background flex-shrink-0">
          <button
            onClick={() => setMobileTab('products')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              mobileTab === 'products'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setMobileTab('cart')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 relative ${
              mobileTab === 'cart'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            Cart
            {cartCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden p-3">
          {mobileTab === 'products' ? productPanel : cartPanel}
        </div>

        {/* Mobile quick-access Cart FAB when on products tab */}
        {mobileTab === 'products' && cartCount > 0 && (
          <div className="absolute bottom-4 right-4">
            <Button
              onClick={() => setMobileTab('cart')}
              className="h-12 w-12 rounded-full shadow-lg p-0 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* ── Held Orders Modal ── */}
      {showHeldOrders && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowHeldOrders(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Held Orders</h2>
              <button
                onClick={() => setShowHeldOrders(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {state.heldOrders.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No held orders
                </p>
              ) : (
                state.heldOrders.map((held: HeldOrder) => (
                  <div
                    key={held.id}
                    className="border border-border rounded-xl p-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {held.label}
                      </p>
                      {held.customer && (
                        <p className="text-xs text-muted-foreground">
                          {held.customer.name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {held.cartLines.length} item(s) · Rp{' '}
                        {computeOrderTotal(
                          held.cartLines,
                          held.orderDiscount,
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button
                        size="sm"
                        className="text-xs h-7 px-3"
                        onClick={() => {
                          dispatch({ type: 'RECALL_ORDER', id: held.id });
                          setShowHeldOrders(false);
                        }}
                      >
                        Recall
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          dispatch({ type: 'DISCARD_HELD', id: held.id })
                        }
                      >
                        Discard
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 pb-5">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowHeldOrders(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
