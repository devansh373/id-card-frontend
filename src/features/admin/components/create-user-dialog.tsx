import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Shield, Building2 } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { adminService } from '@/features/admin/services/admin-service';
import { createUserSchema, type CreateUserFormValues } from '@/lib/validators/admin';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'TEACHER', // default role
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateUserFormValues) => adminService.createUser(values),
    onSuccess: () => {
      toast.success('System user created successfully.');
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    },
  });

  const onSubmit = (data: CreateUserFormValues) => {
    mutation.mutate(data);
  };

  const selectedRole = form.watch('role');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add System User</DialogTitle>
          <DialogDescription>
            Create a new staff or admin account. They will be prompted to change their password upon their first login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="staff@school.edu"
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
                placeholder="Ensure it's secure..."
                className="pl-9 h-11"
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">System Role *</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-slate-400">
                <Shield className="w-4 h-4" />
              </div>
              <Select
                value={form.watch('role')}
                onValueChange={(val: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'VENDOR' | null) => {
                  if (val) form.setValue('role', val, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="pl-9 h-11">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">System Administrator</SelectItem>
                  <SelectItem value="SCHOOL_ADMIN">School Administrator</SelectItem>
                  <SelectItem value="TEACHER">Teaching Staff</SelectItem>
                  {/* Avoid offering VENDOR here since they have a separate flow, but it's technically supported */}
                </SelectContent>
              </Select>
            </div>
            {form.formState.errors.role && (
              <p className="text-xs text-rose-500 font-medium">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          {/* If SCHOOL_ADMIN or TEACHER, we could optionally ask for a School ID if we wanted to enforce it here.
              For now keeping it optional integer in schema. */}
          {(selectedRole === 'SCHOOL_ADMIN' || selectedRole === 'TEACHER') && (
            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID (Optional for direct assignment)</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="schoolId"
                  type="number"
                  placeholder="e.g. 1"
                  className="pl-9 h-11"
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    form.setValue('schoolId', val);
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Leave blank if the user will be assigned later.</p>
            </div>
          )}

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
              className="bg-indigo-600 hover:bg-indigo-700 shadow-sm h-10 px-6 box-border"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
