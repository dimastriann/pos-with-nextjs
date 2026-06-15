'use client';
import { useState, useEffect } from 'react';
import { Uom } from '@/models/MasterData';
import { uomRepository } from '@/repositories/uomRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UomPage() {
  const [data, setData] = useState<Uom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Uom>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => setData(await uomRepository.getAll());

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await uomRepository.delete(id);
      loadData();
    }
  };

  const handleEdit = (item: Uom) => {
    setFormData(item);
    setIsModalOpen(true);
  };
  const handleAddNew = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await uomRepository.update(formData as Uom);
      } else {
        const { id: _, ...data } = formData as Uom;
        await uomRepository.create(data);
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
    { header: 'Name', accessor: 'name' as keyof Uom, className: 'font-medium' },
    {
      header: 'Symbol',
      accessor: 'symbol' as keyof Uom,
      className: 'text-muted-foreground',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Units of Measure"
        description="Manage measurement units (kg, pcs, etc)."
        action={{ label: 'Add Unit', onClick: handleAddNew }}
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
        title={formData.id ? 'Edit Unit' : 'New Unit'}
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
              placeholder="e.g. Kilogram"
            />
          </div>
          <div>
            <Label>Symbol</Label>
            <Input
              required
              value={formData.symbol || ''}
              onChange={(e) =>
                setFormData({ ...formData, symbol: e.target.value })
              }
              placeholder="e.g. kg"
            />
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
              {isLoading ? 'Saving...' : 'Save Unit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
