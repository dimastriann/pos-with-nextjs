'use client';
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/models/User';
import { userRepository } from '@/repositories/userRepository';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { PageHeader } from '@/components/admin/PageHeader';

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
    { header: 'Name', accessor: 'name' as keyof User, className: 'font-medium text-gray-900' },
    { header: 'Username', accessor: 'username' as keyof User },
    { header: 'Role', accessor: (u: User) => <span className="capitalize">{u.role}</span> },
    { header: 'Shop ID', accessor: (u: User) => u.shopId || '-' },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Manage system users and access roles." action={{ label: 'Add User', onClick: handleAddNew }} />
      <DataTable data={users} columns={columns} actions={(item) => (
        <>
          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
        </>
      )} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentUser.id ? 'Edit User' : 'New User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentUser.name || ''} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentUser.username || ''} onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentUser.password || ''} onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })} placeholder={currentUser.id ? 'Leave blank to keep current' : ''} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={currentUser.role} onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as UserRole })}>
              {Object.values(UserRole).map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop ID</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={currentUser.shopId || ''} onChange={(e) => setCurrentUser({ ...currentUser, shopId: e.target.value })} placeholder="Optional" />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">{isLoading ? 'Saving...' : 'Save User'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
