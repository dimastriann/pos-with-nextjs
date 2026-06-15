'use client';
import { useState, useEffect } from 'react';
import { PosShop } from '@/models/PosModels';
import { shopRepository } from '@/repositories/shopRepository';
import { DataTable } from '@/components/admin/DataTable';
import { KanbanCard } from '@/components/admin/KanbanCard';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ShopsPage() {
  const [data, setData] = useState<PosShop[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
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
    setFormData({ active: true });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await shopRepository.update(formData as PosShop);
      } else {
        const { id: _, ...data } = formData as PosShop;
        await shopRepository.create(data);
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
      accessor: 'name' as keyof PosShop,
      className: 'font-medium',
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
            <span>＋</span> Add Shop
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
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
            <Label>Shop Name</Label>
            <Input
              required
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Main Branch"
            />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea
              className="resize-none"
              value={formData.address || ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Full address..."
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
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
