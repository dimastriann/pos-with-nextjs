'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/pos/ProductCard';
import { Button } from '@/components/pos/ControlButton';
import Numpad from '@/components/pos/Numpad';
import { usePOS } from '@/lib/context/POSContextStore';
import { productRepository } from '@/repositories/productRepository';
import { categoryRepository } from '@/repositories/categoryRepository';
import { Product } from '@/models/Product';
import { Category } from '@/models/MasterData';
import { computeCartTotal } from '@/lib/utils/cartCalculations';

export function PosOrderScreen() {
  const { state, dispatch } = usePOS();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([productRepository.getAll(), categoryRepository.getAll()]).then(
      ([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      },
    );
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategoryId === 'all' || p.categoryId === activeCategoryId;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const total = computeCartTotal(state.cartLines);

  return (
    <div className="p-3 grid grid-cols-12 gap-3 flex-1 overflow-hidden">
      {/* Product grid */}
      <div className="col-span-7 flex flex-col overflow-hidden">
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="mb-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* Category tabs */}
        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategoryId === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategoryId(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategoryId === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => dispatch({ type: 'ADD_PRODUCT', product })}
            >
              <CardContent className="p-3">
                <p className="font-semibold text-sm leading-tight">{product.name}</p>
                <p className="text-blue-600 font-bold text-sm mt-1">Rp {product.price.toLocaleString()}</p>
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="text-orange-500 text-xs mt-0.5">Low stock: {product.stock}</p>
                )}
                {product.stock === 0 && <p className="text-red-500 text-xs mt-0.5">Out of stock</p>}
              </CardContent>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400 text-sm">No products found</div>
          )}
        </div>
      </div>

      {/* Control buttons */}
      <div className="col-span-1 flex flex-col gap-1.5 pt-8">
        <Button className="uppercase text-xs" variant="outline" onClick={() => dispatch({ type: 'CLEAR_ORDER' })}>
          Clear
        </Button>
        <Button className="uppercase text-xs" variant="outline" onClick={() => alert('Customer note coming soon')}>
          Note
        </Button>
        <Button className="uppercase text-xs" variant="outline" onClick={() => alert('Discount coming soon')}>
          Disc %
        </Button>
      </div>

      {/* Order panel */}
      <div className="col-span-4 border-l pl-3 flex flex-col overflow-hidden">
        {/* Customer */}
        <button
          onClick={() => alert('Customer lookup coming soon')}
          className="text-sm font-bold text-center p-2 rounded-lg bg-blue-500 text-white mb-2 hover:bg-blue-600 transition-colors"
        >
          {state.customer ? state.customer.name : '+ Add Customer'}
        </button>

        {/* Order lines */}
        <div className="flex-1 overflow-y-auto space-y-1 mb-2">
          {state.cartLines.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Cart is empty</p>
          )}
          {state.cartLines.map((line, index) => (
            <div
              key={`${line.productId}-${index}`}
              onClick={() => dispatch({ type: 'SELECT_LINE', index })}
              className={`relative p-2 rounded-lg border cursor-pointer transition-colors ${
                state.selectedLineIndex === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start pr-5">
                <div>
                  <p className="font-semibold text-sm leading-tight">{line.productName}</p>
                  <p className="text-xs text-gray-500">
                    {line.qty} × Rp {line.price.toLocaleString()}
                    {line.discount > 0 && ` − ${line.discount}%`}
                  </p>
                </div>
                <p className="font-bold text-sm">Rp {line.subtotal.toLocaleString()}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_LINE', index }); }}
                className="absolute top-1 right-2 text-gray-400 hover:text-red-500 font-bold text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-2 mb-1">
          <div className="flex justify-between items-center font-bold text-base">
            <span>Total</span>
            <span className="text-blue-700">Rp {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Numpad */}
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
}
