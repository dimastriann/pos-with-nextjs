'use client';
import { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderLine } from '@/models/InventoryModels';
import { Product } from '@/models/Product';
import { Contact } from '@/models/MasterData';
import { purchaseOrderRepository } from '@/repositories/purchaseOrderRepository';
import { productRepository } from '@/repositories/productRepository';
import { contactRepository } from '@/repositories/contactRepository';
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
import { X, Plus } from 'lucide-react';

function StatusBadge({ status }: { status: PurchaseOrder['status'] }) {
  const cls = {
    Draft: 'bg-warning-50 text-warning-600 dark:bg-warning-500/[0.12] dark:text-warning-500',
    Confirmed: 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400',
    Received: 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls[status]}`}>
      {status}
    </span>
  );
}

interface DraftLine {
  productId: string;
  qty: string;
  costPrice: string;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Contact[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [viewLines, setViewLines] = useState<PurchaseOrderLine[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const [form, setForm] = useState({
    supplierId: '',
    expectedDate: '',
    notes: '',
  });
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    { productId: '', qty: '', costPrice: '' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pos, prods, contacts] = await Promise.all([
      purchaseOrderRepository.getAll(),
      productRepository.getAll(),
      contactRepository.getAll(),
    ]);
    setOrders([...pos].reverse());
    setProducts(prods.filter((p) => p.active !== false));
    setSuppliers(contacts.filter((c) => c.type === 'Supplier'));
  };

  const openCreate = () => {
    setForm({ supplierId: '', expectedDate: '', notes: '' });
    setDraftLines([{ productId: '', qty: '', costPrice: '' }]);
    setIsCreateOpen(true);
  };

  const handleView = async (order: PurchaseOrder) => {
    const lines = await purchaseOrderRepository.getLinesByOrderId(order.id);
    setSelectedOrder(order);
    setViewLines(lines);
    setIsViewOpen(true);
  };

  const addLine = () =>
    setDraftLines((l) => [...l, { productId: '', qty: '', costPrice: '' }]);

  const removeLine = (i: number) =>
    setDraftLines((l) => l.filter((_, idx) => idx !== i));

  const updateLine = (i: number, field: keyof DraftLine, value: string) =>
    setDraftLines((l) =>
      l.map((line, idx) => {
        if (idx !== i) return line;
        const updated = { ...line, [field]: value };
        if (field === 'productId') {
          const prod = products.find((p) => p.id === value);
          if (prod) updated.costPrice = prod.costPrice?.toString() ?? '';
        }
        return updated;
      }),
    );

  const handleCreate = async () => {
    const supplier = suppliers.find((s) => s.id === form.supplierId);
    if (!supplier) return;

    const validLines = draftLines.filter(
      (l) => l.productId && parseInt(l.qty) > 0,
    );
    if (validLines.length === 0) return;

    setIsSaving(true);
    try {
      const lines = validLines.map((l) => {
        const qty = parseInt(l.qty);
        const costPrice = parseFloat(l.costPrice) || 0;
        const prod = products.find((p) => p.id === l.productId)!;
        return {
          productId: prod.id,
          productName: prod.name,
          qty,
          costPrice,
          subtotal: qty * costPrice,
        };
      });

      await purchaseOrderRepository.create(
        {
          supplierId: supplier.id,
          supplierName: supplier.name,
          expectedDate: form.expectedDate || undefined,
          notes: form.notes || undefined,
        },
        lines,
      );
      await loadData();
      setIsCreateOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async (order: PurchaseOrder) => {
    setIsActing(true);
    try {
      await purchaseOrderRepository.confirm(order.id);
      await loadData();
      if (selectedOrder?.id === order.id) {
        const updated = await purchaseOrderRepository.getById(order.id);
        setSelectedOrder(updated);
      }
    } finally {
      setIsActing(false);
    }
  };

  const handleReceive = async (order: PurchaseOrder) => {
    setIsActing(true);
    try {
      await purchaseOrderRepository.receive(order.id);
      await loadData();
      if (selectedOrder?.id === order.id) {
        const updated = await purchaseOrderRepository.getById(order.id);
        setSelectedOrder(updated);
      }
    } finally {
      setIsActing(false);
    }
  };

  const orderTotal = (lines: PurchaseOrderLine[]) =>
    lines.reduce((s, l) => s + l.subtotal, 0);

  const columns = [
    {
      header: 'PO #',
      accessor: (o: PurchaseOrder) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {o.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Supplier',
      accessor: (o: PurchaseOrder) => (
        <p className="font-medium text-gray-800 dark:text-white/90">{o.supplierName}</p>
      ),
    },
    {
      header: 'Date',
      accessor: (o: PurchaseOrder) => (
        <div>
          <p className="text-sm">{new Date(o.date).toLocaleDateString()}</p>
          {o.expectedDate && (
            <p className="text-xs text-gray-400">
              Expected: {new Date(o.expectedDate).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (o: PurchaseOrder) => <StatusBadge status={o.status} />,
    },
  ];

  const draftTotal = draftLines.reduce((s, l) => {
    const qty = parseInt(l.qty) || 0;
    const cp = parseFloat(l.costPrice) || 0;
    return s + qty * cp;
  }, 0);

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Order stock from suppliers and receive goods."
        action={{ label: 'New PO', onClick: openCreate }}
      />
      <DataTable
        data={orders}
        columns={columns}
        actions={(item) => (
          <div className="flex gap-1">
            <Button variant="link" size="sm" className="text-primary" onClick={() => handleView(item)}>
              View
            </Button>
            {item.status === 'Draft' && (
              <Button variant="link" size="sm" className="text-brand-500" onClick={() => handleConfirm(item)}>
                Confirm
              </Button>
            )}
            {item.status === 'Confirmed' && (
              <Button variant="link" size="sm" className="text-success-600 dark:text-success-400" onClick={() => handleReceive(item)}>
                Receive
              </Button>
            )}
          </div>
        )}
      />

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Purchase Order">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Supplier</Label>
              <Select value={form.supplierId} onValueChange={(v) => setForm((f) => ({ ...f, supplierId: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expected Delivery</Label>
              <Input type="date" value={form.expectedDate} onChange={(e) => setForm((f) => ({ ...f, expectedDate: e.target.value }))} />
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional…" />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Products</Label>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addLine}>
                <Plus className="h-3 w-3" /> Add Line
              </Button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground w-20">Qty</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground w-28">Cost (Rp)</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {draftLines.map((line, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1.5">
                        <Select value={line.productId} onValueChange={(v) => updateLine(i, 'productId', v ?? '')}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Product…" /></SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" min={1} value={line.qty} onChange={(e) => updateLine(i, 'qty', e.target.value)} className="h-8 text-xs text-right [appearance:textfield]" placeholder="0" />
                      </td>
                      <td className="px-2 py-1.5">
                        <Input type="number" min={0} value={line.costPrice} onChange={(e) => updateLine(i, 'costPrice', e.target.value)} className="h-8 text-xs text-right [appearance:textfield]" placeholder="0" />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {draftLines.length > 1 && (
                          <button onClick={() => removeLine(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/20">
                    <td colSpan={2} className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-foreground">
                      Rp {draftTotal.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-border">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!form.supplierId || draftLines.every((l) => !l.productId) || isSaving}
            >
              {isSaving ? 'Creating…' : 'Create PO'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      {selectedOrder && (
        <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`PO #${selectedOrder.id.slice(0, 8).toUpperCase()}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-muted/40 rounded-xl p-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Supplier</p>
                <p className="font-medium">{selectedOrder.supplierName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Date</p>
                <p>{new Date(selectedOrder.date).toLocaleString()}</p>
              </div>
              {selectedOrder.expectedDate && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Expected</p>
                  <p>{new Date(selectedOrder.expectedDate).toLocaleDateString()}</p>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Notes</p>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Cost</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {viewLines.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 text-foreground">{l.productName}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{l.qty}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">Rp {l.costPrice.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-medium">Rp {l.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/20">
                    <td colSpan={3} className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</td>
                    <td className="px-3 py-2 text-right font-bold text-foreground">Rp {orderTotal(viewLines).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between pt-1 border-t border-border">
              <div className="flex gap-2">
                {selectedOrder.status === 'Draft' && (
                  <Button variant="outline" onClick={() => handleConfirm(selectedOrder)} disabled={isActing}>
                    {isActing ? 'Processing…' : 'Confirm Order'}
                  </Button>
                )}
                {selectedOrder.status === 'Confirmed' && (
                  <Button onClick={() => handleReceive(selectedOrder)} disabled={isActing}>
                    {isActing ? 'Receiving…' : 'Receive Goods'}
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
