'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Store,
  Clock,
  ShoppingBag,
  ListOrdered,
  CreditCard,
  Package,
  Tag,
  Ruler,
  Warehouse,
  Users,
  Contact,
  Wallet,
  ArrowUpDown,
  ClipboardList,
  AlertTriangle,
  Percent,
  Layers,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { adapter } from '@/adapters';
import { User } from '@/models/User';
import { cn } from '@/lib/utils';

type SubItem = { label: string; href: string; icon: React.ElementType };
type MenuItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  subItems?: SubItem[];
  group?: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    group: 'Main Menu',
  },
  {
    label: 'POS Management',
    icon: Store,
    group: 'Main Menu',
    subItems: [
      { label: 'Shops', href: '/admin/shops', icon: Store },
      { label: 'Sessions', href: '/admin/sessions', icon: Clock },
    ],
  },
  {
    label: 'Sales & Orders',
    icon: ShoppingBag,
    group: 'Main Menu',
    subItems: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      {
        label: 'Order Details',
        href: '/admin/order-details',
        icon: ListOrdered,
      },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    label: 'Inventory',
    icon: Package,
    group: 'Main Menu',
    subItems: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Tag },
      { label: 'Unit of Measure', href: '/admin/uom', icon: Ruler },
      { label: 'Warehouses', href: '/admin/warehouses', icon: Warehouse },
      { label: 'Stock Adjustments', href: '/admin/stock-adjustments', icon: ArrowUpDown },
      { label: 'Purchase Orders', href: '/admin/purchase-orders', icon: ClipboardList },
      { label: 'Low Stock Alerts', href: '/admin/low-stock', icon: AlertTriangle },
    ],
  },
  {
    label: 'Promotions',
    icon: Percent,
    group: 'Main Menu',
    subItems: [
      { label: 'Promotions', href: '/admin/promotions', icon: Percent },
      { label: 'Price Groups', href: '/admin/price-groups', icon: Layers },
    ],
  },
  {
    label: 'Configuration',
    icon: Users,
    group: 'Others',
    subItems: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Contacts', href: '/admin/contacts', icon: Contact },
      {
        label: 'Payment Methods',
        href: '/admin/payment-methods',
        icon: Wallet,
      },
    ],
  },
];

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
      {initials}
    </div>
  );
}

interface SidebarContentProps {
  isExpanded: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

export function SidebarContent({
  isExpanded,
  onToggle,
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'POS Management': true,
    'Sales & Orders': true,
    Inventory: true,
    Promotions: false,
    Configuration: false,
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    adapter.getCurrentUser().then(setCurrentUser);
  }, []);

  const toggleMenu = (label: string) => {
    if (!isExpanded) return;
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const groups = ['Main Menu', 'Others'];

  return (
    <TooltipProvider delay={0}>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {/* Logo */}
        <div
          className={cn(
            'flex items-center flex-shrink-0 h-16 border-b border-gray-200 dark:border-gray-800',
            isExpanded ? 'px-6 justify-start' : 'px-0 justify-center',
          )}
        >
          {isExpanded ? (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                POS<span className="text-brand-500">Flow</span>
              </span>
            </Link>
          ) : (
            <Link href="/admin/dashboard">
              <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
            </Link>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
          <nav className={cn('space-y-0.5', isExpanded ? 'px-4' : 'px-3')}>
            {groups.map((group) => {
              const items = MENU_ITEMS.filter((m) => m.group === group);
              return (
                <div key={group} className="mb-4">
                  {isExpanded && (
                    <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {group}
                    </p>
                  )}

                  {items.map((item, idx) => {
                    const GroupIcon = item.icon;

                    if (item.subItems) {
                      const isOpen = openMenus[item.label];
                      const isGroupActive = item.subItems.some((s) =>
                        pathname.startsWith(s.href),
                      );

                      if (!isExpanded) {
                        return (
                          <div key={idx} className="space-y-0.5 mb-0.5">
                            {item.subItems.map((sub) => {
                              const SubIcon = sub.icon;
                              const isActive = pathname.startsWith(sub.href);
                              return (
                                <Tooltip key={sub.href}>
                                  <TooltipTrigger
                                    render={
                                      <Link
                                        href={sub.href}
                                        onClick={onNavigate}
                                        className={cn(
                                          'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors',
                                          isActive
                                            ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5',
                                        )}
                                      >
                                        <SubIcon className="h-5 w-5" />
                                      </Link>
                                    }
                                  />
                                  <TooltipContent
                                    side="right"
                                    className="text-xs"
                                  >
                                    {sub.label}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="mb-0.5">
                          <button
                            onClick={() => toggleMenu(item.label)}
                            className={cn(
                              'menu-item w-full justify-between',
                              isGroupActive
                                ? 'text-brand-500 dark:text-brand-400'
                                : 'menu-item-inactive',
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <GroupIcon className="h-5 w-5 flex-shrink-0" />
                              <span>{item.label}</span>
                            </span>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform duration-200',
                                isOpen ? 'rotate-180' : '',
                              )}
                            />
                          </button>
                          {isOpen && (
                            <div className="mt-0.5 ml-5 pl-3 border-l border-gray-100 dark:border-gray-800 space-y-0.5">
                              {item.subItems.map((sub) => {
                                const SubIcon = sub.icon;
                                const isActive = pathname.startsWith(sub.href);
                                return (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    onClick={onNavigate}
                                    className={cn(
                                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-theme-sm transition-colors',
                                      isActive
                                        ? 'bg-brand-50 text-brand-500 font-medium dark:bg-brand-500/[0.12] dark:text-brand-400'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5',
                                    )}
                                  >
                                    <SubIcon className="h-4 w-4 flex-shrink-0" />
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Top-level direct link
                    const isActive = item.href
                      ? pathname.startsWith(item.href)
                      : false;

                    if (!isExpanded) {
                      return (
                        <Tooltip key={item.href || idx}>
                          <TooltipTrigger
                            render={
                              <Link
                                href={item.href || '#'}
                                onClick={onNavigate}
                                className={cn(
                                  'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors mb-0.5',
                                  isActive
                                    ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5',
                                )}
                              >
                                <GroupIcon className="h-5 w-5" />
                              </Link>
                            }
                          />
                          <TooltipContent side="right" className="text-xs">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <Link
                        key={item.href || idx}
                        href={item.href || '#'}
                        onClick={onNavigate}
                        className={cn(
                          'menu-item mb-0.5',
                          isActive ? 'menu-item-active' : 'menu-item-inactive',
                        )}
                      >
                        <GroupIcon className="h-5 w-5 flex-shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div
          className={cn(
            'flex-shrink-0 border-t border-gray-200 dark:border-gray-800 py-4',
            isExpanded ? 'px-4 space-y-3' : 'px-3 space-y-3',
          )}
        >
          {currentUser && isExpanded && (
            <div className="flex items-center gap-3 px-2 py-1">
              <UserAvatar name={currentUser.name} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                  {currentUser.role}
                </p>
              </div>
            </div>
          )}
          {!isExpanded && currentUser && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex justify-center cursor-default">
                    <UserAvatar name={currentUser.name} />
                  </div>
                }
              />
              <TooltipContent side="right" className="text-xs">
                {currentUser.name} · {currentUser.role}
              </TooltipContent>
            </Tooltip>
          )}

          <div
            className={cn(
              'flex items-center',
              isExpanded
                ? 'justify-between px-1'
                : 'flex-col gap-2 items-center',
            )}
          >
            {isExpanded ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      href="/login"
                      className="flex items-center justify-center h-9 w-9 rounded-lg text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </Link>
                  }
                />
                <TooltipContent side="right" className="text-xs">
                  Log Out
                </TooltipContent>
              </Tooltip>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

interface AdminSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isExpanded, onToggle }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen z-99999 hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out',
        isExpanded ? 'w-[290px]' : 'w-[90px]',
      )}
    >
      <SidebarContent isExpanded={isExpanded} onToggle={onToggle} />
    </aside>
  );
}
