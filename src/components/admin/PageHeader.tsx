import Link from 'next/link';
import { ChevronRight, Home, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
      <div>
        <nav className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-1.5">
          <Link
            href="/admin/dashboard"
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            <Home className="h-3 w-3" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {title}
          </span>
        </nav>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="flex-shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
