'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Printer, 
  Search, 
  Loader2, 
  UserCog, 
  MapPin, 
  Phone, 
  Building2,
  Plus
} from 'lucide-react';

import { adminService, type UserFilters } from '@/features/admin/services/admin-service';
import type { UserProfile } from '@/types/auth';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditVendorDialog } from '@/features/admin/components/edit-vendor-dialog';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';

export default function VendorsManagementPage() {
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

  const [editingVendor, setEditingVendor] = useState<UserProfile | null>(null);

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
        }[status];
        
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
         <div className="flex justify-end gap-2">
            <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setEditingVendor(row.original)}
               className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
               <UserCog className="w-4 h-4 mr-2" />
               Edit Partner
            </Button>
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

      <EditVendorDialog 
        vendor={editingVendor} 
        onClose={() => setEditingVendor(null)} 
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
             <Button variant="outline" className="h-10 text-slate-500 border-slate-200 hover:bg-slate-50" onClick={() => toast.info("To create a vendor, register a User and set role to 'VENDOR'")}>
                <Plus className="w-4 h-4 mr-2" /> Add Partner
             </Button>
          </div>
        </div>

        <CardContent className="p-0 flex-1">
          <DataTable 
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            pageCount={data?.pagination.totalPages}
            currentPage={page}
            onPaginationChange={setPage}
            emptyMessage={
              search ? "No vendors match your search." : "No printing partners registered. Vendors can be onboarded via the User Directory."
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
