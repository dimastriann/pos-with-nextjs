'use client';
import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { productRepository } from '@/repositories/productRepository';
import { DataTable } from '@/components/admin/DataTable';
import { PageHeader } from '@/components/admin/PageHeader';

export default function LowStockPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productRepository.getAll().then((prods) => {
      const low = prods.filter(
        (p) => p.active !== false && p.minStock !== undefined && p.stock <= p.minStock,
      );
      setProducts(low.sort((a, b) => {
        const aRatio = a.stock / (a.minStock ?? 1);
        const bRatio = b.stock / (b.minStock ?? 1);
        return aRatio - bRatio;
      }));
    });
  }, []);

  const columns = [
    {
      header: 'Product',
      accessor: (p: Product) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">{p.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.sku}</p>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      accessor: (p: Product) => (
        <span
          className={`text-lg font-bold ${
            p.stock === 0
              ? 'text-error-600 dark:text-error-400'
              : 'text-warning-600 dark:text-warning-500'
          }`}
        >
          {p.stock}
        </span>
      ),
    },
    {
      header: 'Min Stock',
      accessor: (p: Product) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{p.minStock}</span>
      ),
    },
    {
      header: 'Shortage',
      accessor: (p: Product) => {
        const shortage = (p.minStock ?? 0) - p.stock;
        return (
          <span className="text-sm font-medium text-error-600 dark:text-error-400">
            -{shortage}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: (p: Product) => {
        if (p.stock === 0) {
          return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-error-50 text-error-600 dark:bg-error-500/[0.12] dark:text-error-400">
              Out of Stock
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/[0.12] dark:text-warning-500">
            Low Stock
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Low Stock Alerts"
        description={`${products.length} product${products.length !== 1 ? 's' : ''} at or below minimum stock threshold.`}
      />
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-16 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">All stocked up!</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            No products are below their minimum stock level.
          </p>
        </div>
      ) : (
        <DataTable data={products} columns={columns} />
      )}
    </div>
  );
}
