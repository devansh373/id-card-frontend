'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Plus, 
  Loader2, 
  Building2, 
  Mail, 
  Fingerprint, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Key,
  FolderOpen,
  Link as LinkIcon
} from 'lucide-react';

import { adminService } from '@/features/admin/services/admin-service';
import { registerSchoolSchema, type RegisterSchoolFormValues } from '@/lib/validators/admin';
import type { SchoolProfile } from '@/types/school';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { EditSchoolDialog } from '@/features/admin/components/edit-school-dialog';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

export default function SchoolsManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Edit State
  const [selectedSchool, setSelectedSchool] = useState<SchoolProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete State
  const [schoolToDelete, setSchoolToDelete] = useState<SchoolProfile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // --- Fetch Schools ---
  const { data, isLoading } = useQuery({
    queryKey: ['admin-schools', page],
    queryFn: () => adminService.getSchools(page, 10),
  });

  // --- Registration Mutation ---
  const registrationForm = useForm<RegisterSchoolFormValues>({
    resolver: zodResolver(registerSchoolSchema),
    defaultValues: {
      name: '',
      code: '',
      adminEmail: '',
      imagekitPublicKey: '',
      imagekitPrivateKey: '',
      imagekitUrlEndpoint: '',
      imagekitFolder: '',
    }
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterSchoolFormValues) => adminService.registerSchool(values),
    onSuccess: () => {
      toast.success('School registered successfully. Credentials sent to admin email.');
      setIsDialogOpen(false);
      registrationForm.reset();
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Failed to register school');
    }
  });

  // --- Delete Mutation ---
  const handleDeleteConfirm = async () => {
    if (!schoolToDelete) return;
    try {
      await adminService.deleteSchool(schoolToDelete.id);
      toast.success('School marked as deleted (inactive).');
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to delete school');
      throw err;
    }
  };

  // --- Table Columns ---
  const columns: ColumnDef<SchoolProfile>[] = [
    {
      accessorKey: 'name',
      header: 'School Details',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700">{row.original.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="secondary" className="text-[10px] font-mono h-4 px-1.5">
              {row.original.code}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'adminEmail',
      header: 'Administrator',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm">{row.original.adminEmail || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Onboarded On',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-sm">
            {new Date(row.original.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => {
                  setSelectedSchool(row.original);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="w-4 h-4 text-slate-500" /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600"
                onClick={() => {
                  setSchoolToDelete(row.original);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" /> Soft Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">School Management</h1>
          <p className="text-slate-500 text-sm">Onboard new educational institutions and manage system-wide school profiles.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-[#1E293B] hover:bg-[#334155] gap-2 shadow-lg shadow-indigo-500/10" />}>
              <Plus className="w-4 h-4" />
              Onboard New School
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register School</DialogTitle>
              <DialogDescription>
                Create a new school account. Temporary credentials will be sent to the administrator email provided.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={registrationForm.handleSubmit((v) => registerMutation.mutate(v))} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full School Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="name" 
                    {...registrationForm.register('name')} 
                    placeholder="e.g. Springfield International School" 
                    className="pl-9 h-11"
                  />
                </div>
                {registrationForm.formState.errors.name && (
                  <p className="text-xs text-rose-500 font-medium">{registrationForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">School Code (Unique)*</Label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="code" 
                      {...registrationForm.register('code')} 
                      placeholder="e.g. SIS001" 
                      className="pl-9 h-11 uppercase"
                    />
                  </div>
                  {registrationForm.formState.errors.code && (
                    <p className="text-xs text-rose-500 font-medium">{registrationForm.formState.errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="email" 
                      {...registrationForm.register('adminEmail')} 
                      placeholder="admin@school.com" 
                      className="pl-9 h-11"
                    />
                  </div>
                  {registrationForm.formState.errors.adminEmail && (
                    <p className="text-xs text-rose-500 font-medium">{registrationForm.formState.errors.adminEmail.message}</p>
                  )}
                </div>
              </div>

              <Accordion className="w-full mt-4">
                <AccordionItem value="advanced-settings" className="border-slate-200">
                  <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:text-indigo-600">
                    Advanced Settings (ImageKit Credentials)
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2 space-y-4">
                    
                    <div className="space-y-2">
                      <Label htmlFor="ik-pub">Public Key</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="ik-pub" 
                          {...registrationForm.register('imagekitPublicKey')} 
                          placeholder="Optional" 
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ik-priv">Private Key</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="ik-priv" 
                          type="password"
                          {...registrationForm.register('imagekitPrivateKey')} 
                          placeholder="Optional" 
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ik-url">URL Endpoint</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="ik-url" 
                          {...registrationForm.register('imagekitUrlEndpoint')} 
                          placeholder="https://ik.imagekit.io/..." 
                          className="pl-9"
                        />
                      </div>
                      {registrationForm.formState.errors.imagekitUrlEndpoint && (
                         <p className="text-xs text-rose-500 font-medium">{registrationForm.formState.errors.imagekitUrlEndpoint.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ik-folder">Folder Path</Label>
                      <div className="relative">
                        <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          id="ik-folder" 
                          {...registrationForm.register('imagekitFolder')} 
                          placeholder="e.g. /school/photos" 
                          className="pl-9"
                        />
                      </div>
                    </div>

                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base shadow-lg shadow-emerald-500/10"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering School...
                    </>
                  ) : (
                    'Confirm & Send Credentials'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Area */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-[#1E293B]">All Schools</CardTitle>
            <CardDescription className="text-xs">System-wide directory of all educational entities.</CardDescription>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
        </CardHeader>
        <CardContent className="p-0">
          <DataTable 
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            pageCount={data?.pagination?.totalPages}
            currentPage={page}
            onPaginationChange={setPage}
            emptyMessage="No schools onboarded yet. Get started by adding your first school."
          />
        </CardContent>
      </Card>

      <EditSchoolDialog 
        school={selectedSchool}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete School"
        description={<>Are you sure you want to deactivate <b>{schoolToDelete?.name}</b>? This action will suspend access for all associated staffs and prevent further ID card printing.</>}
        onConfirm={handleDeleteConfirm}
        confirmText="Deactivate School"
      />

    </div>
  );
}
