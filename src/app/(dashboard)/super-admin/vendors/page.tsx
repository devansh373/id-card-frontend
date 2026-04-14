'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Printer, 
  Search, 
  Loader2, 
  MapPin, 
  Phone, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

import { adminService, type UserFilters } from '@/features/admin/services/admin-service';
import type { UserProfile } from '@/types/auth';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { EditVendorDialog } from '@/features/admin/components/edit-vendor-dialog';
import { CreateVendorDialog } from '@/features/admin/components/create-vendor-dialog';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';

export default function VendorsManagementPage() {
  const queryClient = useQueryClient();
  
  // --- Filter & Pagination State ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  
  // Strictly filter for Vendors
  const filters: UserFilters = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    role: 'VENDOR', 
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-vendors', filters],
    queryFn: () => adminService.getUsers(filters),
    placeholderData: (prev) => prev,
  });

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<UserProfile | null>(null);
  
  const [vendorToDelete, setVendorToDelete] = useState<UserProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- Delete Mutation ---
  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;
    try {
      await adminService.deleteUser(vendorToDelete.id);
      toast.success('Vendor marked as deleted (inactive).');
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to delete vendor');
      throw err;
    }
  };

  const columns: ColumnDef<UserProfile>[] = [
    {
      accessorKey: 'vendorName',
      header: 'Vendor Partner',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <Printer className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">{row.original.vendorName || 'Unnamed Vendor'}</span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'vendorStatus',
      header: 'Lifecycle',
      cell: ({ row }) => {
        const status = row.original.vendorStatus || 'INACTIVE';
        const config = {
          ONBOARDING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          INACTIVE: 'bg-slate-50 text-slate-500 border-slate-200',
        }[status] || 'bg-slate-50 text-slate-500 border-slate-200';
        
        return <Badge variant="outline" className={`font-medium ${config}`}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'location',
      header: 'Contact & Location',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
             <MapPin className="w-3 h-3 text-slate-400" /> {row.original.location || 'Remote'}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
             <Phone className="w-3 h-3 text-slate-400" /> {row.original.phoneNumber || 'No phone'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'System Access',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          {row.original.isActive ? (
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          )}
          <span className="text-xs font-medium">{row.original.isActive ? 'Enabled' : 'Disabled'}</span>
        </div>
      ),
    },
    {
       id: 'actions',
       header: () => <div className="text-right">Manage</div>,
       cell: ({ row }) => (
         <div className="flex justify-end pr-2">
           <DropdownMenu>
             <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                 <span className="sr-only">Open menu</span>
                 <MoreHorizontal className="h-4 w-4" />
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-[160px]">
               <DropdownMenuItem
                 className="gap-2 cursor-pointer text-amber-700 focus:text-amber-700"
                 onClick={() => setEditingVendor(row.original)}
               >
                 <Edit className="w-4 h-4" /> Edit Profile
               </DropdownMenuItem>
               <DropdownMenuItem
                 className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600"
                 onClick={() => {
                   setVendorToDelete(row.original);
                   setIsDeleteDialogOpen(true);
                 }}
               >
                 <Trash2 className="w-4 h-4" /> Deactivate
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       )
    }
  ];

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Vendor Management</h1>
          <p className="text-slate-500 text-sm">Register and manage printing partners responsible for physical card distribution.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="h-9 px-3 text-amber-600 border-amber-200 bg-amber-50">
             <Printer className="w-4 h-4 mr-2" />
             {data?.pagination.total || 0} Total Partners
           </Badge>
        </div>
      </div>

      <CreateVendorDialog 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditVendorDialog 
        vendor={editingVendor} 
        onClose={() => setEditingVendor(null)} 
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Deactivate Vendor"
        description={<>Are you sure you want to deactivate <b>{vendorToDelete?.vendorName}</b>? This vendor will no longer be able to log in or process print queues.</>}
        onConfirm={handleDeleteConfirm}
        confirmText="Deactivate Vendor"
      />

      <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search partners by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 border-slate-200 bg-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
             {isFetching && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
             <Button className="bg-[#1E293B] hover:bg-[#334155] shadow-lg gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4" /> Add Partner
             </Button>
          </div>
        </div>

        <CardContent className="p-0 flex-1">
          <DataTable 
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            pageCount={data?.pagination?.totalPages}
            currentPage={page}
            onPaginationChange={setPage}
            emptyMessage={
              search ? "No vendors match your search." : "No printing partners registered."
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
