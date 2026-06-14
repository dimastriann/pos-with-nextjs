'use client';
import { useState, useEffect } from 'react';
import { Warehouse } from '@/models/MasterData';
import { warehouseRepository } from '@/repositories/warehouseRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';

export default function WarehousesPage() {
  const [data, setData] = useState<Warehouse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Warehouse>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => setData(await warehouseRepository.getAll());

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) { await warehouseRepository.delete(id); loadData(); }
  };

  const handleEdit = (item: Warehouse) => { setFormData(item); setIsModalOpen(true); };
  const handleAddNew = () => { setFormData({}); setIsModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await warehouseRepository.update(formData as Warehouse);
      } else {
        const { id: _, ...data } = formData as Warehouse;
        await warehouseRepository.create(data);
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
    { header: 'Name', accessor: 'name' as keyof Warehouse, className: 'font-medium text-gray-900' },
    { header: 'Location', accessor: 'location' as keyof Warehouse, className: 'text-gray-500' },
  ];

  return (
    <div>
      <PageHeader title="Warehouses" description="Manage inventory locations." action={{ label: 'Add Warehouse', onClick: handleAddNew }} />
      <DataTable data={data} columns={columns} actions={(item) => (
        <>
          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
        </>
      )} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? 'Edit Warehouse' : 'New Warehouse'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Central Warehouse" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Jakarta Selatan" />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">{isLoading ? 'Saving...' : 'Save Warehouse'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
