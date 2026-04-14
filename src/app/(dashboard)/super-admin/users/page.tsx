'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Users, 
  Search, 
  Loader2, 
  ShieldCheck, 
  Printer, 
  GraduationCap, 
  UserCircle,
  CheckCircle2,
  XCircle,
  Hash,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

import { adminService, type UserFilters } from '@/features/admin/services/admin-service';
import type { UserProfile, UserRole } from '@/types/auth';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { EditUserDialog } from '@/features/admin/components/edit-user-dialog';
import { CreateUserDialog } from '@/features/admin/components/create-user-dialog';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';

export default function UsersManagementPage() {
  const queryClient = useQueryClient();

  // --- Filter & Pagination State ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  
  const filters: UserFilters = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.getUsers(filters),
    placeholderData: (prev) => prev,
  });

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- Delete Mutation ---
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await adminService.deleteUser(userToDelete.id);
      toast.success('User deactivated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to deactivate user');
      throw err;
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<UserProfile>[] = [
    {
      accessorKey: 'email',
      header: 'User Account',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <UserCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">{row.original.email}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="text-[10px] text-slate-400 font-mono">ID: {row.original.id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role;
        const config = {
          SUPER_ADMIN: { label: 'Admin', icon: ShieldCheck, color: 'text-rose-700 bg-rose-50 border-rose-200' },
          SCHOOL_ADMIN: { label: 'School Admin', icon: GraduationCap, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
          TEACHER: { label: 'Teacher', icon: Users, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          VENDOR: { label: 'Vendor', icon: Printer, color: 'text-amber-700 bg-amber-50 border-amber-200' },
        }[role];

        const Icon = config.icon || UserCircle;
        
        return (
          <div className="space-y-1 flex flex-col items-start">
            <Badge variant="outline" className={`font-medium shadow-sm flex items-center gap-1 pl-1 ${config?.color || ''}`}>
              <Icon className="w-3 h-3" />
              {config?.label || role}
            </Badge>
            {row.original.school && (
              <span className="text-[10px] text-slate-400 font-medium px-1 flex items-center gap-1">
                 <Hash className="w-2.5 h-2.5" /> {row.original.school.name}
              </span>
            )}
            {row.original.vendorName && (
               <span className="text-[10px] text-amber-500 font-medium px-1 flex items-center gap-1">
                 <Printer className="w-2.5 h-2.5" /> {row.original.vendorName}
               </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isActive ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 shadow-none gap-1.5 pr-2 pl-1.5 h-7">
               <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-slate-100 text-slate-500 gap-1.5 pr-2 pl-1.5 h-7">
               <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
            </Badge>
          )}
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
                 className="gap-2 cursor-pointer text-indigo-700 focus:text-indigo-700"
                 onClick={() => setEditingUser(row.original)}
               >
                 <Edit className="w-4 h-4" /> Edit Profile
               </DropdownMenuItem>
               <DropdownMenuItem
                 className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600"
                 onClick={() => {
                   setUserToDelete(row.original);
                   setIsDeleteDialogOpen(true);
                 }}
               >
                 <Trash2 className="w-4 h-4" /> Deactivate
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1E293B]">System User Directory</h1>
        <p className="text-slate-500 text-sm">Monitor and manage all accounts, roles, and administrative permissions across the ecosystem.</p>
      </div>

      <CreateUserDialog 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditUserDialog 
        user={editingUser} 
        onClose={() => setEditingUser(null)} 
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Deactivate System User"
        description={<>Are you sure you want to deactivate <b>{userToDelete?.email}</b>? This user will no longer be able to log in to the system.</>}
        onConfirm={handleDeleteConfirm}
        confirmText="Deactivate User"
      />

      {/* Main Table Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by email, vendor name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 border-slate-200 bg-white shadow-sm"
              />
            </div>
            
            <Select 
              value={roleFilter} 
              onValueChange={(val: string | null) => {
                setRoleFilter((val || 'ALL') as UserRole | 'ALL');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 shadow-sm">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">System Admins</SelectItem>
                <SelectItem value="SCHOOL_ADMIN">School Admins</SelectItem>
                <SelectItem value="TEACHER">Teachers</SelectItem>
                <SelectItem value="VENDOR">Vendors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
             {isFetching && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
             <div className="text-xs text-slate-400 font-medium bg-slate-100/80 px-2 py-1 rounded hidden sm:block">
               Found {data?.pagination.total || 0} users
             </div>
             <Button className="bg-[#1E293B] hover:bg-[#334155] shadow-lg gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4" /> Add User
             </Button>
          </div>
        </div>

        {/* Data Table */}
        <CardContent className="p-0 flex-1">
          <DataTable 
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            pageCount={data?.pagination?.totalPages}
            currentPage={page}
            onPaginationChange={setPage}
            emptyMessage={
              search || roleFilter !== 'ALL' 
                ? "No matching users found in the system." 
                : "No users exist in the system database."
            }
          />
        </CardContent>
      </Card>

    </div>
  );
}
