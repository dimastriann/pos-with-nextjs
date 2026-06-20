'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminSidebar, SidebarContent } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed desktop sidebar */}
      <AdminSidebar
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((v) => !v)}
      />

      {/* Mobile sheet drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[290px] p-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
        >
          <SidebarContent
            isExpanded={true}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main content — offset by sidebar width */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          isExpanded ? 'md:ml-[290px]' : 'md:ml-[90px]',
        )}
      >
        <AdminHeader
          onMobileMenuOpen={() => setMobileOpen(true)}
          onSidebarToggle={() => setIsExpanded((v) => !v)}
        />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-screen-xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
