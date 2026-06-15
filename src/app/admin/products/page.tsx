'use client';
import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { productRepository } from '@/repositories/productRepository';
import { categoryRepository } from '@/repositories/categoryRepository';
import { Category } from '@/models/MasterData';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [items, cats] = await Promise.all([
      productRepository.getAll(),
      categoryRepository.getAll(),
    ]);
    setProducts(items);
    setCategories(cats);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await productRepository.delete(id);
      loadData();
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentProduct({ stock: 0 });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentProduct.id) {
        await productRepository.update(currentProduct as Product);
      } else {
        const { id: _, ...data } = currentProduct as Product;
        await productRepository.create(data);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Product,
      className: 'font-medium',
    },
    {
      header: 'Barcode',
      accessor: (p: Product) =>
        p.barcode || <span className="text-muted-foreground">—</span>,
    },
    {
      header: 'Price',
      accessor: (p: Product) => `Rp ${p.price.toLocaleString()}`,
    },
    { header: 'Stock', accessor: 'stock' as keyof Product },
    {
      header: 'Category',
      accessor: (p: Product) =>
        categories.find((c) => c.id === p.categoryId)?.name || '-',
    },
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
            <Button
              variant="link"
              size="sm"
              className="text-primary"
              onClick={() => handleEdit(item)}
            >
              Edit
            </Button>
            <Button
              variant="link"
              size="sm"
              className="text-destructive"
              onClick={() => handleDelete(item.id)}
            >
              Delete
            </Button>
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
            <Label>Name</Label>
            <Input
              required
              value={currentProduct.name || ''}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, name: e.target.value })
              }
              placeholder="e.g. Mineral Water"
            />
          </div>
          <div>
            <Label>Price (Rp)</Label>
            <Input
              type="number"
              required
              min={0}
              value={currentProduct.price || ''}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  price: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              required
              min={0}
              value={currentProduct.stock ?? ''}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  stock: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={currentProduct.categoryId || ''}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  categoryId: e.target.value,
                })
              }
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Barcode / SKU</Label>
            <Input
              value={currentProduct.barcode || ''}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  barcode: e.target.value,
                })
              }
              placeholder="e.g. 8991234560001"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              className="resize-none"
              value={currentProduct.description || ''}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
