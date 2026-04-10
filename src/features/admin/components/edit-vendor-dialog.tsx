'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axios from 'axios';
import { Printer, Loader2, Building2, Phone, MapPin } from 'lucide-react';

import { adminService } from '@/features/admin/services/admin-service';
import { manageUserSchema, type ManageUserFormValues } from '@/lib/validators/admin';
import type { UserProfile, VendorStatus } from '@/types/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface EditVendorDialogProps {
  vendor: UserProfile | null;
  onClose: () => void;
}

export function EditVendorDialog({ vendor, onClose }: EditVendorDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ManageUserFormValues>({
    resolver: zodResolver(manageUserSchema),
    defaultValues: {
      email: vendor?.email || '',
      role: 'VENDOR',
      isActive: vendor?.isActive ?? true,
      mustChangePassword: vendor?.mustChangePassword ?? false,
      vendorName: vendor?.vendorName || '',
      phoneNumber: vendor?.phoneNumber || '',
      location: vendor?.location || '',
      vendorStatus: (vendor?.vendorStatus || 'ACTIVE') as VendorStatus,
      schoolId: vendor?.schoolId ?? undefined,
    }
  });

  const mutation = useMutation({
    mutationFn: (values: ManageUserFormValues) => adminService.updateUser(vendor!.id, values),
    onSuccess: () => {
      toast.success('Vendor profile updated');
      onClose();
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError<{ message: string }>(err)) {
        toast.error(err.response?.data?.message || 'Update failed');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  return (
    <Dialog open={!!vendor} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-500" />
            Edit Printing Partner
          </DialogTitle>
          <DialogDescription>Manage organizational details and service status for {vendor?.email}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v as unknown as ManageUserFormValues))} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Company / Vendor Name</Label>
              <div className="relative">
                 <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input {...form.register('vendorName')} className="pl-9 h-11" placeholder="e.g. Acme Printing Corp" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Onboarding Status</Label>
              <Select 
                value={form.watch('vendorStatus')}
                onValueChange={(val: string | null) => form.setValue('vendorStatus', (val || 'ACTIVE') as VendorStatus)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-center gap-2 border border-slate-100 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="vendor-active" className="cursor-pointer text-sm">Access Enabled</Label>
                <Switch 
                  id="vendor-active"
                  checked={form.watch('isActive')}
                  onCheckedChange={(val: boolean) => form.setValue('isActive', val)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input {...form.register('phoneNumber')} className="pl-9 h-11" placeholder="+1..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location / City</Label>
              <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input {...form.register('location')} className="pl-9 h-11" placeholder="e.g. New York" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
             <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
             <Button type="submit" disabled={mutation.isPending} className="bg-amber-600 hover:bg-amber-700 min-w-[120px]">
               {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
