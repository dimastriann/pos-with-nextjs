'use client';
import { useState, useEffect } from 'react';
import { StockAdjustment } from '@/models/InventoryModels';
import { Product } from '@/models/Product';
import { stockAdjustmentRepository } from '@/repositories/stockAdjustmentRepository';
import { productRepository } from '@/repositories/productRepository';
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

const REASONS = {
  in: ['Restock', 'Supplier Delivery', 'Return from Customer', 'Found in Count', 'Other'],
  out: ['Damaged / Expired', 'Theft / Loss', 'Sample / Promo', 'Other'],
  correction: ['Inventory Count Correction', 'System Error Fix', 'Other'],
};

function TypeBadge({ type }: { type: StockAdjustment['type'] }) {
  const cls = {
    in: 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400',
    out: 'bg-error-50 text-error-600 dark:bg-error-500/[0.12] dark:text-error-400',
    correction: 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400',
  };
  const label = { in: 'Stock In', out: 'Stock Out', correction: 'Correction' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls[type]}`}>
      {label[type]}
    </span>
  );
}

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    productId: '',
    type: 'in' as StockAdjustment['type'],
    qty: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [adjs, prods] = await Promise.all([
      stockAdjustmentRepository.getAll(),
      productRepository.getAll(),
    ]);
    setAdjustments([...adjs].reverse());
    setProducts(prods.filter((p) => p.active !== false));
  };

  const openModal = () => {
    setForm({ productId: '', type: 'in', qty: '', reason: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const product = products.find((p) => p.id === form.productId);
    if (!product || !form.qty || !form.reason) return;

    const rawQty = parseInt(form.qty);
    if (isNaN(rawQty) || rawQty === 0) return;

    const qty = form.type === 'out' ? -Math.abs(rawQty) : Math.abs(rawQty);

    setIsSaving(true);
    try {
      await stockAdjustmentRepository.create({
        productId: product.id,
        productName: product.name,
        qty,
        type: form.type,
        reason: form.reason,
        notes: form.notes || undefined,
      });
      await loadData();
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === form.productId);
  const reasons = REASONS[form.type] ?? [];

  const columns = [
    {
      header: 'Product',
      accessor: (a: StockAdjustment) => (
        <p className="font-medium text-gray-800 dark:text-white/90">{a.productName}</p>
      ),
    },
    {
      header: 'Type',
      accessor: (a: StockAdjustment) => <TypeBadge type={a.type} />,
    },
    {
      header: 'Qty',
      accessor: (a: StockAdjustment) => (
        <span className={`font-bold ${a.qty > 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
          {a.qty > 0 ? `+${a.qty}` : a.qty}
        </span>
      ),
    },
    {
      header: 'Reason',
      accessor: (a: StockAdjustment) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{a.reason}</p>
          {a.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.notes}</p>}
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: (a: StockAdjustment) => (
        <div>
          <p className="text-sm">{new Date(a.date).toLocaleDateString()}</p>
          <p className="text-xs text-gray-400">{new Date(a.date).toLocaleTimeString()}</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        description="Manually adjust stock levels with a reason."
        action={{ label: 'New Adjustment', onClick: openModal }}
      />
      <DataTable data={adjustments} columns={columns} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Stock Adjustment"
      >
        <div className="space-y-4">
          <div>
            <Label>Product</Label>
            <Select
              value={form.productId}
              onValueChange={(v) => setForm((f) => ({ ...f, productId: v ?? '', reason: '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product…" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    <span className="ml-2 text-xs text-gray-400">(stock: {p.stock})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="text-xs text-gray-400 mt-1">
                Current stock: <strong>{selectedProduct.stock}</strong>
                {selectedProduct.minStock !== undefined && ` · min: ${selectedProduct.minStock}`}
              </p>
            )}
          </div>

          <div>
            <Label>Adjustment Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, type: v as StockAdjustment['type'], reason: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Stock In (add)</SelectItem>
                <SelectItem value="out">Stock Out (remove)</SelectItem>
                <SelectItem value="correction">Correction (set direction via qty)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={form.qty}
              onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
              placeholder={form.type === 'correction' ? 'Positive = add, negative = remove' : 'e.g. 10'}
            />
          </div>

          <div>
            <Label>Reason</Label>
            <Select
              value={form.reason}
              onValueChange={(v) => setForm((f) => ({ ...f, reason: v ?? '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason…" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Additional details…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.productId || !form.qty || !form.reason || isSaving}
            >
              {isSaving ? 'Saving…' : 'Save Adjustment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
