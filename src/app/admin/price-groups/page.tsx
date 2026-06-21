'use client';
import { useState, useEffect } from 'react';
import { PriceGroup, PriceGroupItem } from '@/models/PromoModels';
import { Product } from '@/models/Product';
import { priceGroupRepository } from '@/repositories/priceGroupRepository';
import { productRepository } from '@/repositories/productRepository';
import { PageHeader } from '@/components/admin/PageHeader';
import { Modal } from '@/components/admin/Modal';
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
import { Plus, X, Tag } from 'lucide-react';

interface GroupWithItems extends PriceGroup {
  items: PriceGroupItem[];
}

export default function PriceGroupsPage() {
  const [groups, setGroups] = useState<GroupWithItems[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupWithItems | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({ name: '', description: '' });
  const [draftItems, setDraftItems] = useState<
    { productId: string; customPrice: string; existingId?: string }[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [gs, prods] = await Promise.all([
      priceGroupRepository.getAll(),
      productRepository.getAll(),
    ]);
    const withItems = await Promise.all(
      gs.map(async (g) => ({
        ...g,
        items: await priceGroupRepository.getItemsByGroupId(g.id),
      })),
    );
    setGroups(withItems);
    setProducts(prods.filter((p) => p.active !== false));
  };

  const openCreate = () => {
    setEditingGroup(null);
    setForm({ name: '', description: '' });
    setDraftItems([{ productId: '', customPrice: '' }]);
    setIsCreateOpen(true);
  };

  const openEdit = (g: GroupWithItems) => {
    setEditingGroup(g);
    setForm({ name: g.name, description: g.description ?? '' });
    setDraftItems(
      g.items.length
        ? g.items.map((i) => ({
            productId: i.productId,
            customPrice: i.customPrice.toString(),
            existingId: i.id,
          }))
        : [{ productId: '', customPrice: '' }],
    );
    setIsCreateOpen(true);
  };

  const addDraftItem = () =>
    setDraftItems((d) => [...d, { productId: '', customPrice: '' }]);

  const removeDraftItem = (i: number) =>
    setDraftItems((d) => d.filter((_, idx) => idx !== i));

  const updateDraftItem = (
    i: number,
    field: 'productId' | 'customPrice',
    value: string,
  ) =>
    setDraftItems((d) =>
      d.map((item, idx) => {
        if (idx !== i) return item;
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const prod = products.find((p) => p.id === value);
          if (prod && !item.customPrice) updated.customPrice = prod.price.toString();
        }
        return updated;
      }),
    );

  const handleSave = async () => {
    if (!form.name) return;
    setIsSaving(true);
    try {
      const validItems = draftItems.filter(
        (i) => i.productId && parseFloat(i.customPrice) >= 0,
      );

      if (editingGroup) {
        // Update group metadata
        await priceGroupRepository.update({ ...editingGroup, name: form.name, description: form.description || undefined });

        // Delete removed items
        const keptIds = new Set(validItems.map((i) => i.existingId).filter(Boolean));
        for (const existing of editingGroup.items) {
          if (!keptIds.has(existing.id)) {
            await priceGroupRepository.deleteItem(existing.id);
          }
        }

        // Upsert valid items
        for (const item of validItems) {
          const prod = products.find((p) => p.id === item.productId)!;
          await priceGroupRepository.upsertItem({
            id: item.existingId,
            priceGroupId: editingGroup.id,
            productId: prod.id,
            productName: prod.name,
            customPrice: parseFloat(item.customPrice),
          });
        }
      } else {
        const group = await priceGroupRepository.create({
          name: form.name,
          description: form.description || undefined,
        });
        for (const item of validItems) {
          const prod = products.find((p) => p.id === item.productId)!;
          await priceGroupRepository.upsertItem({
            priceGroupId: group.id,
            productId: prod.id,
            productName: prod.name,
            customPrice: parseFloat(item.customPrice),
          });
        }
      }

      await loadData();
      setIsCreateOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this price group? Customers assigned to it will keep their assignment but prices will no longer apply.')) return;
    await priceGroupRepository.delete(id);
    await loadData();
  };

  return (
    <div>
      <PageHeader
        title="Price Groups"
        description="Assign custom product prices to customer tiers."
        action={{ label: 'New Price Group', onClick: openCreate }}
      />

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-16 text-center">
          <Tag className="h-8 w-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No price groups yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create price groups and assign them to contacts for tiered pricing.
          </p>
          <Button className="mt-4" onClick={openCreate}>New Price Group</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-border bg-white dark:bg-gray-900 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white/90">{g.name}</h3>
                  {g.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {g.items.length} product{g.items.length !== 1 ? 's' : ''}
                </span>
              </div>

              {g.items.length > 0 && (
                <div className="space-y-1">
                  {g.items.slice(0, 4).map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const base = prod?.price ?? 0;
                    const diff = item.customPrice - base;
                    return (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 truncate pr-2">{item.productName}</span>
                        <span className="font-medium text-gray-800 dark:text-white/90 flex-shrink-0">
                          Rp {item.customPrice.toLocaleString()}
                          {base > 0 && (
                            <span className={`ml-1 text-xs ${diff < 0 ? 'text-success-600 dark:text-success-400' : diff > 0 ? 'text-error-500' : 'text-gray-400'}`}>
                              ({diff < 0 ? '' : '+'}{diff.toLocaleString()})
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                  {g.items.length > 4 && (
                    <p className="text-xs text-gray-400">+{g.items.length - 4} more</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1 border-t border-border">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openEdit(g)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-error-500 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10 text-xs"
                  onClick={() => handleDelete(g.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingGroup ? `Edit — ${editingGroup.name}` : 'New Price Group'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Group Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Wholesale, VIP, Member"
              />
            </div>
            <div className="col-span-2">
              <Label>Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Who is this price group for?"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Custom Product Prices</Label>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addDraftItem}>
                <Plus className="h-3 w-3" /> Add Product
              </Button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground w-32">Custom Price</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {draftItems.map((item, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1.5">
                        <Select
                          value={item.productId}
                          onValueChange={(v) => updateDraftItem(i, 'productId', v ?? '')}
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Product…" /></SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                                <span className="ml-1 text-xs text-gray-400">
                                  (Rp {p.price.toLocaleString()})
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1.5">
                        <Input
                          type="number"
                          min={0}
                          value={item.customPrice}
                          onChange={(e) => updateDraftItem(i, 'customPrice', e.target.value)}
                          className="h-8 text-xs text-right [appearance:textfield]"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {draftItems.length > 1 && (
                          <button onClick={() => removeDraftItem(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Assign this group to a customer via the Contacts page. Prices auto-apply in POS when that customer is selected.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-border">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || isSaving}>
              {isSaving ? 'Saving…' : editingGroup ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
