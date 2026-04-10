'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { UserCog, Printer, Loader2 } from 'lucide-react';

import { adminService } from '@/features/admin/services/admin-service';
import { manageUserSchema, type ManageUserFormValues } from '@/lib/validators/admin';
import type { UserProfile, UserRole, VendorStatus } from '@/types/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface EditUserDialogProps {
  user: UserProfile | null;
  onClose: () => void;
}

export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  const queryClient = useQueryClient();

  const editingVendorStatus = user?.vendorStatus === 'INACTIVE' ? 'INACTIVE' : 
                              user?.vendorStatus === 'ONBOARDING' ? 'ONBOARDING' : 'ACTIVE';

  const form = useForm<ManageUserFormValues>({
    resolver: zodResolver(manageUserSchema),
    defaultValues: {
      email: user?.email || '',
      role: user?.role || 'TEACHER',
      isActive: user?.isActive ?? true,
      mustChangePassword: user?.mustChangePassword ?? false,
      vendorName: user?.vendorName || '',
      phoneNumber: user?.phoneNumber || '',
      location: user?.location || '',
      vendorStatus: editingVendorStatus as VendorStatus,
      schoolId: user?.schoolId ?? undefined,
    }
  });

  const mutation = useMutation({
    mutationFn: (values: ManageUserFormValues) => adminService.updateUser(user!.id, values),
    onSuccess: () => {
      toast.success('User updated successfully');
      onClose();
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError<{ message: string }>(err)) {
        toast.error(err.response?.data?.message || 'Update failed');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const selectedRole = form.watch('role');

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-indigo-500" />
            Edit User Profile
          </DialogTitle>
          <DialogDescription>Modify permissions, status and information for {user?.email}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v as unknown as ManageUserFormValues))} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>System Role</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(val: string | null) => form.setValue('role', (val || 'TEACHER') as UserRole)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-center gap-2 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="active-switch" className="cursor-pointer">Active Status</Label>
                <Switch 
                  id="active-switch"
                  checked={form.watch('isActive')}
                  onCheckedChange={(val: boolean) => form.setValue('isActive', val)}
                />
              </div>
              <p className="text-[10px] text-slate-500">Enable or disable entire account access.</p>
            </div>
          </div>

          {/* Vendor Specific Fields */}
          {selectedRole === 'VENDOR' && (
            <div className="space-y-4 p-4 border border-amber-100 bg-amber-50/30 rounded-xl">
               <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                 <Printer className="w-3.5 h-3.5" /> Vendor Specific Details
               </p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company Name</Label>
                    <Input {...form.register('vendorName')} placeholder="e.g. Acme Prints" className="bg-white h-10" />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-xs">Vendor Status</Label>
                     <Select 
                      value={form.watch('vendorStatus')}
                      onValueChange={(val: string | null) => form.setValue('vendorStatus', (val || 'ACTIVE') as VendorStatus)}
                     >
                       <SelectTrigger className="bg-white h-10">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                         <SelectItem value="ACTIVE">Active</SelectItem>
                         <SelectItem value="INACTIVE">Inactive</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone Number</Label>
                    <Input {...form.register('phoneNumber')} className="bg-white h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Location</Label>
                    <Input {...form.register('location')} className="bg-white h-10" />
                  </div>
               </div>
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
             <div className="flex-1 flex items-center gap-2">
                <Switch 
                  id="password-reset"
                  checked={form.watch('mustChangePassword')}
                  onCheckedChange={(val: boolean) => form.setValue('mustChangePassword', val)}
                />
               <Label htmlFor="password-reset" className="text-xs font-medium cursor-pointer">Force password reset on next login</Label>
             </div>
             <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
             <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]">
               {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
