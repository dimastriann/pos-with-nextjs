'use client';
import { useState, useEffect } from 'react';
import { Category } from '@/models/MasterData';
import { categoryRepository } from '@/repositories/categoryRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => setData(await categoryRepository.getAll());

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await categoryRepository.delete(id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await categoryRepository.update(formData as Category);
      } else {
        const { id: _, ...data } = formData as Category;
        await categoryRepository.create(data);
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
      accessor: 'name' as keyof Category,
      className: 'font-medium',
    },
    {
      header: 'Description',
      accessor: 'description' as keyof Category,
      className: 'text-muted-foreground',
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
        title={formData.id ? 'Edit Category' : 'New Category'}
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
              placeholder="e.g. Beverages"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              className="resize-none"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description..."
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
              {isLoading ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
