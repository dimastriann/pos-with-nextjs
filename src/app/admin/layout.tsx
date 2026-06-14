'use client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
