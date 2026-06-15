'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingCart, ScanBarcode } from 'lucide-react';
import Numpad from '@/components/pos/Numpad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { usePOS } from '@/lib/context/POSContextStore';
import { productRepository } from '@/repositories/productRepository';
import { categoryRepository } from '@/repositories/categoryRepository';
import { useBarcodeScanner } from '@/lib/hooks/useBarcodeScanner';
import { Product } from '@/models/Product';
import { Category } from '@/models/MasterData';
import { computeCartTotal } from '@/lib/utils/cartCalculations';

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

  useEffect(() => {
    Promise.all([productRepository.getAll(), categoryRepository.getAll()]).then(
      ([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      },
    );
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

  const filteredProducts = products.filter((p) => {
    const matchCat =
      activeCategoryId === 'all' || p.categoryId === activeCategoryId;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const total = computeCartTotal(state.cartLines);
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
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
              onClick={() => {
                dispatch({ type: 'ADD_PRODUCT', product });
                // Auto-switch to cart tab on mobile after adding
                setMobileTab('cart');
              }}
            >
              <CardContent className="p-3">
                <p className="font-semibold text-sm leading-tight text-card-foreground">
                  {product.name}
                </p>
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
      {/* Customer */}
      <Button
        variant="default"
        className="w-full mb-2 text-sm flex-shrink-0"
        onClick={() => alert('Customer lookup coming soon')}
      >
        {state.customer ? state.customer.name : '+ Add Customer'}
      </Button>

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
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => alert('Note coming soon')}
          >
            Note
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => alert('Discount coming soon')}
          >
            Disc %
          </Button>
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
    </>
  );
}
