'use client';
import { useState, useEffect } from 'react';
import { Contact } from '@/models/MasterData';
import { contactRepository } from '@/repositories/contactRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ContactsPage() {
  const [data, setData] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => setData(await contactRepository.getAll());

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) { await contactRepository.delete(id); loadData(); }
  };

  const handleEdit = (item: Contact) => { setFormData(item); setIsModalOpen(true); };
  const handleAddNew = () => { setFormData({ type: 'Customer' }); setIsModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await contactRepository.update(formData as Contact);
      } else {
        const { id: _, ...data } = formData as Contact;
        await contactRepository.create(data);
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
    { header: 'Name', accessor: 'name' as keyof Contact, className: 'font-medium' },
    { header: 'Type', accessor: 'type' as keyof Contact },
    { header: 'Phone', accessor: 'phone' as keyof Contact },
    { header: 'Email', accessor: 'email' as keyof Contact },
  ];

  return (
    <div>
      <PageHeader title="Contacts" description="Manage customers and suppliers." action={{ label: 'Add Contact', onClick: handleAddNew }} />
      <DataTable data={data} columns={columns} actions={(item) => (
        <>
          <Button variant="link" size="sm" className="text-primary" onClick={() => handleEdit(item)}>Edit</Button>
          <Button variant="link" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
        </>
      )} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? 'Edit Contact' : 'New Contact'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Contact['type'] })}>
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
            </select>
          </div>
          <div>
            <Label>Name</Label>
            <Input required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Contact'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
