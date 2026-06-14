'use client';
import { useState, useEffect } from 'react';
import { Category } from '@/models/MasterData';
import { storageService, STORAGE_KEYS } from '@/services/storage';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = storageService.getAll<Category>(STORAGE_KEYS.CATEGORIES);
    setData(items);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      storageService.remove(STORAGE_KEYS.CATEGORIES, id);
      loadData();
    }
  };

  const handleEdit = (item: Category) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      storageService.update(STORAGE_KEYS.CATEGORIES, formData as Category);
    } else {
      const newItem = { ...formData, id: Date.now().toString() } as Category;
      storageService.add(STORAGE_KEYS.CATEGORIES, newItem);
    }
    setIsModalOpen(false);
    loadData();
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof Category,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Description',
      accessor: 'description' as keyof Category,
      className: 'text-gray-500',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Product Categories"
        description="Manage product categories for your store."
        action={{ label: 'Add Category', onClick: handleAddNew }}
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
        title={formData.id ? 'Edit Category' : 'New Category'}
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
              placeholder="e.g. Beverages"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow h-24 resize-none"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description..."
            />
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
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
