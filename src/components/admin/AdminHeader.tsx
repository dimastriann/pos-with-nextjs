'use client';
import { useEffect, useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { adapter } from '@/adapters';
import { User } from '@/models/User';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  onMobileMenuOpen: () => void;
  onSidebarToggle: () => void;
}

function UserInfo({ name, role }: { name: string; role: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
      <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
        {initials}
      </div>
      <div className="hidden md:block text-left">
        <p className="text-sm font-semibold text-gray-800 dark:text-white/90 leading-tight">
          {name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize leading-tight mt-0.5">
          {role}
        </p>
      </div>
    </button>
  );
}

export function AdminHeader({
  onMobileMenuOpen,
  onSidebarToggle,
}: AdminHeaderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    adapter.getCurrentUser().then(setCurrentUser);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 px-4 md:px-6 gap-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400"
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar toggle */}
      <button
        className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 items-center justify-center"
        onClick={onSidebarToggle}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search bar */}
      <div className="hidden lg:flex relative max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          placeholder="Search..."
          className={cn(
            'h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-4 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-colors',
            'focus:border-brand-300 dark:focus:border-brand-800 focus:bg-white dark:focus:bg-gray-900',
          )}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {currentUser && (
          <>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
            <UserInfo name={currentUser.name} role={currentUser.role} />
          </>
        )}
      </div>
    </header>
  );
}
