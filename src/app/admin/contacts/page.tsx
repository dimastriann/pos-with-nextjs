'use client';
import { useState, useEffect } from 'react';
import { Contact } from '@/models/MasterData';
import { PriceGroup } from '@/models/PromoModels';
import { contactRepository } from '@/repositories/contactRepository';
import { priceGroupRepository } from '@/repositories/priceGroupRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ContactsPage() {
  const [data, setData] = useState<Contact[]>([]);
  const [priceGroups, setPriceGroups] = useState<PriceGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [contacts, groups] = await Promise.all([
      contactRepository.getAll(),
      priceGroupRepository.getAll(),
    ]);
    setData(contacts);
    setPriceGroups(groups);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await contactRepository.delete(id);
      loadData();
    }
  };
  const handleEdit = (item: Contact) => {
    setFormData(item);
    setIsModalOpen(true);
  };
  const handleAddNew = () => {
    setFormData({ type: 'Customer' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (formData.id) {
        await contactRepository.update(formData as Contact);
      } else {
        const { id: _, ...d } = formData as Contact;
        await contactRepository.create(d);
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
      header: 'Contact',
      accessor: (c: Contact) => (
        <div>
          <div className="font-medium">{c.name}</div>
          {c.email && (
            <div className="text-xs text-muted-foreground">{c.email}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (c: Contact) => (
        <Badge
          variant="secondary"
          className={
            c.type === 'Customer'
              ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
              : 'bg-warning-50 text-warning-600 dark:bg-warning-500/[0.12] dark:text-warning-600'
          }
        >
          {c.type}
        </Badge>
      ),
    },
    { header: 'Phone', accessor: 'phone' as keyof Contact },
    {
      header: 'Points',
      accessor: (c: Contact) =>
        c.loyaltyPoints != null && c.loyaltyPoints > 0 ? (
          <span className="text-primary font-medium">
            {c.loyaltyPoints} pts
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: 'Price Group',
      accessor: (c: Contact) => {
        const pg = priceGroups.find((g) => g.id === c.priceGroupId);
        return pg ? (
          <span className="text-xs bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400 px-2 py-0.5 rounded-full font-medium">
            {pg.name}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Manage customers and suppliers."
        action={{ label: 'Add Contact', onClick: handleAddNew }}
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
        title={formData.id ? 'Edit Contact' : 'New Contact'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={formData.type || 'Customer'}
              onValueChange={(val) =>
                setFormData({ ...formData, type: val as Contact['type'] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              required
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Textarea
              className="resize-none"
              rows={2}
              value={formData.address || ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Full address..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tax ID (NPWP)</Label>
            <Input
              value={formData.taxId || ''}
              onChange={(e) =>
                setFormData({ ...formData, taxId: e.target.value })
              }
              placeholder="e.g. 01.234.567.8-901.000"
            />
          </div>
          {formData.type === 'Customer' && priceGroups.length > 0 && (
            <div className="space-y-1.5">
              <Label>Price Group (optional)</Label>
              <Select
                value={formData.priceGroupId ?? '__none__'}
                onValueChange={(v) =>
                  setFormData({ ...formData, priceGroupId: v === '__none__' ? undefined : (v ?? undefined) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No price group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No price group</SelectItem>
                  {priceGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Custom prices from this group will apply when this customer is selected in POS.
              </p>
            </div>
          )}
          {formData.id && (formData.loyaltyPoints ?? 0) > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="text-sm font-medium text-primary">
                Loyalty Points
              </span>
              <span className="text-sm font-bold text-primary">
                {formData.loyaltyPoints} pts = Rp{' '}
                {((formData.loyaltyPoints ?? 0) * 1000).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
