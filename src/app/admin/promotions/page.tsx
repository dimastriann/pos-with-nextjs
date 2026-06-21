'use client';
import { useState, useEffect } from 'react';
import { Promotion } from '@/models/PromoModels';
import { Product } from '@/models/Product';
import { Category } from '@/models/MasterData';
import { promotionRepository } from '@/repositories/promotionRepository';
import { productRepository } from '@/repositories/productRepository';
import { categoryRepository } from '@/repositories/categoryRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function TypeBadge({ type }: { type: Promotion['type'] }) {
  const cls = {
    product: 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400',
    category: 'bg-warning-50 text-warning-600 dark:bg-warning-500/[0.12] dark:text-warning-500',
    order: 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400',
  };
  const label = { product: 'Product', category: 'Category', order: 'Order Total' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls[type]}`}>
      {label[type]}
    </span>
  );
}

const EMPTY_FORM: Omit<Promotion, 'id'> = {
  name: '',
  type: 'product',
  discountPct: 0,
  productId: undefined,
  productName: undefined,
  categoryId: undefined,
  categoryName: undefined,
  minOrderAmount: undefined,
  activeFrom: undefined,
  activeTo: undefined,
  active: true,
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<Omit<Promotion, 'id'>>(EMPTY_FORM);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [promos, prods, cats] = await Promise.all([
      promotionRepository.getAll(),
      productRepository.getAll(),
      categoryRepository.getAll(),
    ]);
    setPromotions([...promos].reverse());
    setProducts(prods.filter((p) => p.active !== false));
    setCategories(cats);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || form.discountPct <= 0) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await promotionRepository.update({ ...form, id: editingId });
      } else {
        await promotionRepository.create(form);
      }
      await loadData();
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this promotion?')) return;
    await promotionRepository.delete(id);
    await loadData();
  };

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const columns = [
    {
      header: 'Name',
      accessor: (p: Promotion) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">{p.name}</p>
          {p.type === 'product' && p.productName && (
            <p className="text-xs text-gray-400 mt-0.5">{p.productName}</p>
          )}
          {p.type === 'category' && p.categoryName && (
            <p className="text-xs text-gray-400 mt-0.5">Category: {p.categoryName}</p>
          )}
          {p.type === 'order' && p.minOrderAmount && (
            <p className="text-xs text-gray-400 mt-0.5">
              Min order: Rp {p.minOrderAmount.toLocaleString()}
            </p>
          )}
        </div>
      ),
    },
    { header: 'Type', accessor: (p: Promotion) => <TypeBadge type={p.type} /> },
    {
      header: 'Discount',
      accessor: (p: Promotion) => (
        <span className="font-bold text-brand-500">{p.discountPct}%</span>
      ),
    },
    {
      header: 'Period',
      accessor: (p: Promotion) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {p.activeFrom ? new Date(p.activeFrom).toLocaleDateString() : 'Any'} –{' '}
          {p.activeTo ? new Date(p.activeTo).toLocaleDateString() : 'No end'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (p: Promotion) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            p.active
              ? 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {p.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Promotions"
        description="Automatic discounts applied in the POS when conditions are met."
        action={{ label: 'New Promotion', onClick: openCreate }}
      />
      <DataTable
        data={promotions}
        columns={columns}
        actions={(item) => (
          <div className="flex gap-1">
            <Button variant="link" size="sm" className="text-brand-500" onClick={() => openEdit(item)}>
              Edit
            </Button>
            <Button variant="link" size="sm" className="text-error-500 dark:text-error-400" onClick={() => handleDelete(item.id)}>
              Delete
            </Button>
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Promotion' : 'New Promotion'}
      >
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Weekend 10% Off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setField('type', (v ?? 'product') as Promotion['type'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product Discount</SelectItem>
                  <SelectItem value="category">Category Discount</SelectItem>
                  <SelectItem value="order">Order Total Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.discountPct}
                onChange={(e) => setField('discountPct', parseFloat(e.target.value) || 0)}
                className="[appearance:textfield]"
              />
            </div>
          </div>

          {form.type === 'product' && (
            <div>
              <Label>Product</Label>
              <Select
                value={form.productId ?? ''}
                onValueChange={(v) => {
                  const prod = products.find((p) => p.id === (v ?? ''));
                  setForm((f) => ({ ...f, productId: prod?.id, productName: prod?.name }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select product…" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.type === 'category' && (
            <div>
              <Label>Category</Label>
              <Select
                value={form.categoryId ?? ''}
                onValueChange={(v) => {
                  const cat = categories.find((c) => c.id === (v ?? ''));
                  setForm((f) => ({ ...f, categoryId: cat?.id, categoryName: cat?.name }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.type === 'order' && (
            <div>
              <Label>Min Order Amount (Rp, optional)</Label>
              <Input
                type="number"
                min={0}
                value={form.minOrderAmount ?? ''}
                onChange={(e) =>
                  setField('minOrderAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="Leave empty to apply to all orders"
                className="[appearance:textfield]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Active From (optional)</Label>
              <Input
                type="date"
                value={form.activeFrom ? form.activeFrom.slice(0, 10) : ''}
                onChange={(e) =>
                  setField('activeFrom', e.target.value ? new Date(e.target.value).toISOString() : undefined)
                }
              />
            </div>
            <div>
              <Label>Active To (optional)</Label>
              <Input
                type="date"
                value={form.activeTo ? form.activeTo.slice(0, 10) : ''}
                onChange={(e) =>
                  setField('activeTo', e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : undefined)
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField('active', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-brand-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name || form.discountPct <= 0 || isSaving}
            >
              {isSaving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
