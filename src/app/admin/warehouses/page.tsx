'use client';
import { useState, useEffect } from 'react';
import { Warehouse } from '@/models/MasterData';
import { warehouseRepository } from '@/repositories/warehouseRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    { header: 'Name', accessor: 'name' as keyof Warehouse, className: 'font-medium' },
    { header: 'Location', accessor: 'location' as keyof Warehouse, className: 'text-muted-foreground' },
  ];

  return (
    <div>
      <PageHeader title="Warehouses" description="Manage inventory locations." action={{ label: 'Add Warehouse', onClick: handleAddNew }} />
      <DataTable data={data} columns={columns} actions={(item) => (
        <>
          <Button variant="link" size="sm" className="text-primary" onClick={() => handleEdit(item)}>Edit</Button>
          <Button variant="link" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
        </>
      )} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? 'Edit Warehouse' : 'New Warehouse'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Central Warehouse" />
          </div>
          <div>
            <Label>Location</Label>
            <Input required value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Jakarta Selatan" />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Warehouse'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
