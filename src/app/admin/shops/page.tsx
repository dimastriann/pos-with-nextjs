'use client';
import { useState, useEffect } from 'react';
import { PosShop } from '@/models/PosModels';
import { storageService, STORAGE_KEYS } from '@/services/storage';
import { DataTable } from '@/components/admin/DataTable';
import { KanbanCard } from '@/components/admin/KanbanCard';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';

export default function ShopsPage() {
  const [data, setData] = useState<PosShop[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PosShop>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = storageService.getAll<PosShop>(STORAGE_KEYS.POS_SHOPS);
    setData(items);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this shop?')) {
      storageService.remove(STORAGE_KEYS.POS_SHOPS, id);
      loadData();
    }
  };

  const handleEdit = (item: PosShop) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ active: true });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      storageService.update(STORAGE_KEYS.POS_SHOPS, formData as PosShop);
    } else {
      const newItem = { ...formData, id: Date.now().toString() } as PosShop;
      storageService.add(STORAGE_KEYS.POS_SHOPS, newItem);
    }
    setIsModalOpen(false);
    loadData();
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof PosShop,
      className: 'font-medium text-gray-900',
    },
    { header: 'Address', accessor: 'address' as keyof PosShop },
    { header: 'Active', accessor: (s: PosShop) => (s.active ? 'Yes' : 'No') },
  ];

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Shops
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage physical shop locations.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Kanban
            </button>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center gap-2"
          >
            <span>＋</span>
            Add Shop
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {data.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              No shops found. Create one to get started.
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formData.id ? 'Edit Shop' : 'New Shop'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name
            </label>
            <input
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Main Branch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow h-20 resize-none"
              value={formData.address || ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Full address..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              value={formData.phone || ''}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="e.g. +62 812..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active ?? true}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="active"
              className="text-sm font-medium text-gray-700"
            >
              Active Shop
            </label>
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
              Save Shop
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
