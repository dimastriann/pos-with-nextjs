'use client';
import { useState, useEffect } from 'react';
import { PaymentMethod } from '@/models/MasterData';
import { storageService, STORAGE_KEYS } from '@/services/storage';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';

export default function PaymentMethodsPage() {
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = storageService.getAll<PaymentMethod>(
      STORAGE_KEYS.PAYMENT_METHODS,
    );
    setData(items);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      storageService.remove(STORAGE_KEYS.PAYMENT_METHODS, id);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      storageService.update(
        STORAGE_KEYS.PAYMENT_METHODS,
        formData as PaymentMethod,
      );
    } else {
      const newItem = {
        ...formData,
        id: Date.now().toString(),
      } as PaymentMethod;
      storageService.add(STORAGE_KEYS.PAYMENT_METHODS, newItem);
    }
    setIsModalOpen(false);
    loadData();
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof PaymentMethod,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Type',
      accessor: 'type' as keyof PaymentMethod,
      className: 'text-gray-500',
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
        title={formData.id ? 'Edit Method' : 'New Payment Method'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Credit Card"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
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
              Save Method
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
