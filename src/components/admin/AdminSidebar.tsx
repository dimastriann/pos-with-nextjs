'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type MenuItem = {
  label: string;
  href?: string;
  icon?: string;
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

export function AdminSidebar() {
  const pathname = usePathname();
  // State to track open menus. Default open based on current path could be added.
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'POS Management': true,
    'Sales & Orders': true,
    Inventory: false,
    Configuration: false,
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-wider">
          POS-FLOW<span className="text-blue-500">.</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Admin Workspace</p>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {MENU_ITEMS.map((item, idx) => {
          if (item.subItems) {
            // Render Group/Dropdown
            const isOpen = openMenus[item.label];
            return (
              <div key={idx} className="mb-2">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <span>{item.label}</span>
                  <span
                    className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="pl-4 space-y-1 mt-1 border-l-2 border-slate-800 ml-3">
                    {item.subItems.map((sub) => {
                      const isActive = pathname.startsWith(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                            isActive
                              ? 'bg-blue-600/10 text-blue-400'
                              : 'hover:bg-slate-800 hover:text-white'
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

          // Render Single Link
          const isActive = item.href ? pathname.startsWith(item.href) : false;
          return (
            <Link
              key={item.href || idx}
              href={item.href || '#'}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 mb-2 ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-slate-800 rounded-md transition-colors"
        >
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}
