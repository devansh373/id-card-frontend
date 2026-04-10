'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pageCount?: number;
  emptyMessage?: string;
  // Optional pagination controls if server-side filtering is passed down
  onPaginationChange?: (page: number) => void;
  currentPage?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pageCount,
  emptyMessage = "No results found.",
  onPaginationChange,
  currentPage = 1,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Client-side pagination if server side `pageCount` isn't provided
    getPaginationRowModel: pageCount === undefined ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton State
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className="py-4">
                      <Skeleton className="h-5 w-full bg-slate-100 rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50 transition-colors border-slate-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 text-sm text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty State
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                      <Inbox className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {(!isLoading && (pageCount !== undefined || table.getPageCount() > 1)) && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onPaginationChange) {
                onPaginationChange(currentPage - 1);
              } else {
                table.previousPage();
              }
            }}
            disabled={onPaginationChange ? currentPage <= 1 : !table.getCanPreviousPage()}
            className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="text-sm text-slate-500 font-medium px-2">
            Page {onPaginationChange ? currentPage : table.getState().pagination.pageIndex + 1} 
            {table.getPageCount() > 0 ? ` of ${table.getPageCount()}` : ''}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onPaginationChange) {
                onPaginationChange(currentPage + 1);
              } else {
                table.nextPage();
              }
            }}
            disabled={
              onPaginationChange 
                ? (pageCount ? currentPage >= pageCount : false)
                : !table.getCanNextPage()
            }
            className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
