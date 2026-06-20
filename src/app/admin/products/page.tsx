'use client';
import { useState, useEffect } from 'react';
import { Product } from '@/models/Product';
import { productRepository } from '@/repositories/productRepository';
import { categoryRepository } from '@/repositories/categoryRepository';
import { uomRepository } from '@/repositories/uomRepository';
import { Category, Uom } from '@/models/MasterData';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUoms] = useState<Uom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [items, cats, uomList] = await Promise.all([
      productRepository.getAll(),
      categoryRepository.getAll(),
      uomRepository.getAll(),
    ]);
    setProducts(items);
    setCategories(cats);
    setUoms(uomList);
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
    setCurrentProduct({ stock: 0, active: true });
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
      header: 'Product',
      accessor: (p: Product) => (
        <div>
          <div className="font-medium">{p.name}</div>
          {p.sku && (
            <div className="text-xs text-muted-foreground">{p.sku}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Price / Cost',
      accessor: (p: Product) => (
        <div>
          <div>Rp {p.price.toLocaleString()}</div>
          {p.costPrice != null && (
            <div className="text-xs text-muted-foreground">
              Cost: Rp {p.costPrice.toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Stock',
      accessor: (p: Product) => (
        <div>
          <span
            className={
              p.minStock != null && p.stock <= p.minStock
                ? 'text-destructive font-medium'
                : ''
            }
          >
            {p.stock}
          </span>
          {p.minStock != null && (
            <span className="text-xs text-muted-foreground">
              {' '}
              / min {p.minStock}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (p: Product) =>
        categories.find((c) => c.id === p.categoryId)?.name || (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: 'Status',
      accessor: (p: Product) =>
        p.active === false ? (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          >
            Inactive
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400"
          >
            Active
          </Badge>
        ),
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                required
                value={currentProduct.name || ''}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, name: e.target.value })
                }
                placeholder="e.g. Mineral Water"
              />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input
                value={currentProduct.sku || ''}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, sku: e.target.value })
                }
                placeholder="e.g. BEV-MW-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Price (Rp) *</Label>
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
            <div className="space-y-1.5">
              <Label>Cost Price (Rp)</Label>
              <Input
                type="number"
                min={0}
                value={currentProduct.costPrice ?? ''}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    costPrice: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stock *</Label>
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
            <div className="space-y-1.5">
              <Label>Min Stock</Label>
              <Input
                type="number"
                min={0}
                value={currentProduct.minStock ?? ''}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    minStock: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Reorder alert"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={currentProduct.categoryId || ''}
                onValueChange={(val) =>
                  setCurrentProduct({
                    ...currentProduct,
                    categoryId: val || undefined,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— None —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— None —</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit of Measure</Label>
              <Select
                value={currentProduct.uomId || ''}
                onValueChange={(val) =>
                  setCurrentProduct({
                    ...currentProduct,
                    uomId: val || undefined,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— None —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— None —</SelectItem>
                  {uoms.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Barcode</Label>
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

          <div className="space-y-1.5">
            <Label>Image URL</Label>
            <Input
              value={currentProduct.image || ''}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, image: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
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

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="prod-active"
              checked={currentProduct.active !== false}
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  active: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <label
              htmlFor="prod-active"
              className="text-sm font-medium cursor-pointer"
            >
              Active (visible in POS)
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-border">
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
