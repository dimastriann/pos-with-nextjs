'use client';
import { useState, useEffect } from 'react';
import { PaymentMethod } from '@/models/MasterData';
import { paymentMethodRepository } from '@/repositories/paymentMethodRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TYPE_BADGE: Record<string, string> = {
  Cash: 'bg-success-50 text-success-600 dark:bg-success-500/[0.12] dark:text-success-400',
  Bank: 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400',
  'E-Wallet':
    'bg-warning-50 text-warning-600 dark:bg-warning-500/[0.12] dark:text-warning-600',
};

export default function PaymentMethodsPage() {
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => setData(await paymentMethodRepository.getAll());

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await paymentMethodRepository.delete(id);
      loadData();
    }
  };
  const handleEdit = (item: PaymentMethod) => {
    setFormData(item);
    setIsModalOpen(true);
  };
  const handleAddNew = () => {
    setFormData({ type: 'Cash' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await paymentMethodRepository.update(formData as PaymentMethod);
      } else {
        const { id: _, ...d } = formData as PaymentMethod;
        await paymentMethodRepository.create(d);
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
      accessor: 'name' as keyof PaymentMethod,
      className: 'font-medium',
    },
    {
      header: 'Type',
      accessor: (p: PaymentMethod) => (
        <Badge
          variant="secondary"
          className={
            TYPE_BADGE[p.type] ??
            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }
        >
          {p.type}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Methods"
        description="Configure accepted payment types."
        action={{ label: 'Add Method', onClick: handleAddNew }}
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
        title={formData.id ? 'Edit Method' : 'New Payment Method'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              required
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Credit Card"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={formData.type || 'Cash'}
              onValueChange={(val) =>
                setFormData({ ...formData, type: val as PaymentMethod['type'] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank">Bank Transfer</SelectItem>
                <SelectItem value="E-Wallet">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
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
              {isLoading ? 'Saving...' : 'Save Method'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
