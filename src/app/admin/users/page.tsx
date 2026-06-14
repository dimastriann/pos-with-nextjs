'use client';
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/models/User';
import { userRepository } from '@/repositories/userRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => setUsers(await userRepository.getAll());

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await userRepository.delete(id);
      loadData();
    }
  };

  const handleEdit = (user: User) => { setCurrentUser(user); setIsModalOpen(true); };
  const handleAddNew = () => { setCurrentUser({ role: UserRole.Cashier }); setIsModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentUser.id) {
        await userRepository.update(currentUser as User);
      } else {
        const { id: _, ...data } = currentUser as User;
        await userRepository.create(data);
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
    { header: 'Name', accessor: 'name' as keyof User, className: 'font-medium' },
    { header: 'Username', accessor: 'username' as keyof User },
    { header: 'Role', accessor: (u: User) => <span className="capitalize">{u.role}</span> },
    { header: 'Shop ID', accessor: (u: User) => u.shopId || '-' },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Manage system users and access roles." action={{ label: 'Add User', onClick: handleAddNew }} />
      <DataTable data={users} columns={columns} actions={(item) => (
        <>
          <Button variant="link" size="sm" className="text-primary" onClick={() => handleEdit(item)}>Edit</Button>
          <Button variant="link" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
        </>
      )} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser.id ? 'Edit User' : 'New User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input required value={currentUser.name || ''} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} />
          </div>
          <div>
            <Label>Username</Label>
            <Input required value={currentUser.username || ''} onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })} />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={currentUser.password || ''} onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })} placeholder={currentUser.id ? 'Leave blank to keep current' : ''} />
          </div>
          <div>
            <Label>Role</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring" value={currentUser.role} onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as UserRole })}>
              {Object.values(UserRole).map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div>
            <Label>Shop ID</Label>
            <Input value={currentUser.shopId || ''} onChange={(e) => setCurrentUser({ ...currentUser, shopId: e.target.value })} placeholder="Optional" />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
