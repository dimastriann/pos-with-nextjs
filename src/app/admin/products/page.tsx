'use client';
import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { storageService, STORAGE_KEYS } from '@/services/storage';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const items = storageService.getAll<Product>(STORAGE_KEYS.PRODUCTS);
    setProducts(items);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      storageService.remove(STORAGE_KEYS.PRODUCTS, id);
      loadProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentProduct({});
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct.id) {
      storageService.update(STORAGE_KEYS.PRODUCTS, currentProduct as Product);
    } else {
      const newProduct = {
        ...currentProduct,
        id: Date.now().toString(),
      } as Product;
      storageService.add(STORAGE_KEYS.PRODUCTS, newProduct);
    }
    setIsModalOpen(false);
    loadProducts();
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Product,
      className: 'font-medium text-gray-900',
    },
    { header: 'Price', accessor: (p: Product) => `$${p.price.toFixed(2)}` },
    { header: 'Stock', accessor: 'stock' as keyof Product },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog."
        action={{ label: 'Add Product', onClick: handleAddNew }}
      />

      <DataTable
        data={products}
        columns={columns}
        actions={(item) => (
          <>
            <button
              onClick={() => handleEdit(item)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProduct.id ? 'Edit Product' : 'New Product'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={currentProduct.name || ''}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={currentProduct.price || ''}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  price: Number(e.target.value),
                })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={currentProduct.stock || ''}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  stock: Number(e.target.value),
                })
              }
              required
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
