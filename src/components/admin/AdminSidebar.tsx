'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type MenuItem = {
  label: string;
  href?: string;
  subItems?: { label: string; href: string }[];
};

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  {
    label: 'POS Management',
    subItems: [
      { label: 'Shops', href: '/admin/shops' },
      { label: 'Sessions', href: '/admin/sessions' },
    ],
  },
  {
    label: 'Sales & Orders',
    subItems: [
      { label: 'Orders', href: '/admin/orders' },
      { label: 'Order Details', href: '/admin/order-details' },
      { label: 'Payments', href: '/admin/payments' },
    ],
  },
  {
    label: 'Inventory',
    subItems: [
      { label: 'Products', href: '/admin/products' },
      { label: 'Categories', href: '/admin/categories' },
      { label: 'Unit of Measure', href: '/admin/uom' },
      { label: 'Warehouses', href: '/admin/warehouses' },
    ],
  },
  {
    label: 'Configuration',
    subItems: [
      { label: 'Users', href: '/admin/users' },
      { label: 'Contacts', href: '/admin/contacts' },
      { label: 'Payment Methods', href: '/admin/payment-methods' },
    ],
  },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'POS Management': true,
    'Sales & Orders': true,
    Inventory: false,
    Configuration: false,
  });

  const toggleMenu = (label: string) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="p-6 flex-shrink-0">
        <h1 className="text-xl font-bold text-white tracking-wider">
          POS-FLOW<span className="text-sidebar-primary">.</span>
        </h1>
        <p className="text-xs text-sidebar-foreground/50 mt-1">
          Admin Workspace
        </p>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-1">
          {MENU_ITEMS.map((item, idx) => {
            if (item.subItems) {
              const isOpen = openMenus[item.label];
              return (
                <div key={idx} className="mb-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="w-full flex justify-between items-center px-3 py-2 text-sm font-semibold text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors rounded-md hover:bg-sidebar-accent"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pl-3 mt-1 space-y-0.5 border-l border-sidebar-border ml-3">
                      {item.subItems.map((sub) => {
                        const isActive = pathname.startsWith(sub.href);
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={onNavigate}
                            className={`block px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                              isActive
                                ? 'bg-sidebar-primary/15 text-sidebar-primary font-medium'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = item.href ? pathname.startsWith(item.href) : false;
            return (
              <Link
                key={item.href || idx}
                href={item.href || '#'}
                onClick={onNavigate}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 mb-1 ${
                  isActive
                    ? 'bg-sidebar-primary/15 text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border flex items-center justify-between flex-shrink-0">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col h-screen border-r border-sidebar-border flex-shrink-0 z-20">
      <SidebarContent />
    </aside>
  );
}
