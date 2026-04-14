import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Store, Mail, Phone, MapPin, Lock } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { adminService } from '@/features/admin/services/admin-service';
import { createVendorSchema, type CreateVendorFormValues } from '@/lib/validators/admin';

interface CreateVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVendorDialog({ open, onOpenChange }: CreateVendorDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateVendorFormValues>({
    resolver: zodResolver(createVendorSchema),
    defaultValues: {
      vendorName: '',
      email: '',
      password: '',
      phoneNumber: '',
      location: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateVendorFormValues) => 
      adminService.createUser({
        ...values,
        role: 'VENDOR',
      }),
    onSuccess: () => {
      toast.success('Printing partner added successfully.');
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }); // vendors share user table
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Failed to create partner account');
    },
  });

  const onSubmit = (data: CreateVendorFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Printing Partner</DialogTitle>
          <DialogDescription>
            Onboard a new vendor. They will be granted vendor access immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="vendorName">Business / Vendor Name *</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="vendorName"
                {...form.register('vendorName')}
                placeholder="e.g. RapidPrint Solutions"
                className="pl-9 h-11"
              />
            </div>
            {form.formState.errors.vendorName && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.vendorName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="contact@vendor.com"
                  className="pl-9 h-11"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-rose-500 font-medium">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="text"
                  {...form.register('password')}
                  placeholder="Secret123!"
                  className="pl-9 h-11"
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-rose-500 font-medium">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="phoneNumber"
                {...form.register('phoneNumber')}
                placeholder="+1 555-0199"
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location / Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="location"
                {...form.register('location')}
                placeholder="123 Printing Ave."
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#1E293B] hover:bg-[#334155] shadow-lg h-10 px-6 box-border"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Vendor'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
