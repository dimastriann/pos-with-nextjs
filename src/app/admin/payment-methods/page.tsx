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
        const { id: _, ...data } = formData as PaymentMethod;
        await paymentMethodRepository.create(data);
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
      accessor: 'type' as keyof PaymentMethod,
      className: 'text-muted-foreground',
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
          <div>
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
          <div>
            <Label>Type</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as PaymentMethod['type'],
                })
              }
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
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
              {isLoading ? 'Saving...' : 'Save Method'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
