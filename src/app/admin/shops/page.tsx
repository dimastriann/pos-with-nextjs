'use client';
import { useState, useEffect } from 'react';
import { PosShop } from '@/models/PosModels';
import { shopRepository } from '@/repositories/shopRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function ShopsPage() {
  const [data, setData] = useState<PosShop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PosShop>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => setData(await shopRepository.getAll());

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shop?')) {
      await shopRepository.delete(id);
      loadData();
    }
  };
  const handleEdit = (item: PosShop) => {
    setFormData(item);
    setIsModalOpen(true);
  };
  const handleAddNew = () => {
    setFormData({ active: true, taxRate: 0 });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await shopRepository.update(formData as PosShop);
      } else {
        const { id: _, ...d } = formData as PosShop;
        await shopRepository.create(d);
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
      header: 'Shop',
      accessor: (s: PosShop) => (
        <div>
          <div className="font-medium">{s.name}</div>
          {s.address && (
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {s.address}
            </div>
          )}
        </div>
      ),
    },
    { header: 'Phone', accessor: 'phone' as keyof PosShop },
    {
      header: 'Tax Rate',
      accessor: (s: PosShop) =>
        s.taxRate != null && s.taxRate > 0 ? `${s.taxRate}%` : '—',
    },
    {
      header: 'Status',
      accessor: (s: PosShop) =>
        s.active ? (
          <Badge
            variant="secondary"
            className="bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          >
            Inactive
          </Badge>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Shops"
        description="Manage physical shop locations."
        action={{ label: 'Add Shop', onClick: handleAddNew }}
      />

      <DataTable
        data={data}
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
        title={formData.id ? 'Edit Shop' : 'New Shop'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Shop Name *</Label>
            <Input
              required
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Main Branch"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+62 21..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="shop@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Address</Label>
            <Textarea
              className="resize-none"
              rows={2}
              value={formData.address || ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Full address..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Logo URL</Label>
            <Input
              value={formData.logoUrl || ''}
              onChange={(e) =>
                setFormData({ ...formData, logoUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={formData.taxRate ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taxRate: e.target.value ? Number(e.target.value) : 0,
                })
              }
              placeholder="e.g. 11 for PPN 11%"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Receipt Footer</Label>
            <Textarea
              className="resize-none"
              rows={2}
              value={formData.receiptFooter || ''}
              onChange={(e) =>
                setFormData({ ...formData, receiptFooter: e.target.value })
              }
              placeholder="Thank you for shopping with us!"
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="shop-active"
              checked={formData.active ?? true}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <label
              htmlFor="shop-active"
              className="text-sm font-medium cursor-pointer"
            >
              Active Shop
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
              {isLoading ? 'Saving...' : 'Save Shop'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
