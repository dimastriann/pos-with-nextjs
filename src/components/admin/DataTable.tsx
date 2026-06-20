import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/80 dark:bg-white/[0.02] hover:bg-gray-50/80 dark:hover:bg-white/[0.02]">
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-start first:rounded-tl-xl last:rounded-tr-xl"
                >
                  {col.header}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  {columns.map((col, idx) => (
                    <TableCell
                      key={idx}
                      className={`px-5 py-4 text-sm text-gray-700 dark:text-gray-300 ${col.className ?? ''}`}
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor] as ReactNode)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {actions(item)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
