import Link from 'next/link';
import { ReactNode } from 'react';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold bg-blue-950">Shop Manager</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/manager/dashboard"
            className="block p-3 rounded hover:bg-blue-800"
          >
            Shop Dashboard
          </Link>
          {/* Add more manager specific links here */}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <Link
            href="/login"
            className="block p-3 rounded hover:bg-red-600 text-center"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
