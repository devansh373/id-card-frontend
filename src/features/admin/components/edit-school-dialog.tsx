import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Building2, 
  Fingerprint, 
  Loader2, 
  Image as ImageIcon,
  Key,
  Link as LinkIcon,
  FolderOpen
} from 'lucide-react';

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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { adminService } from '@/features/admin/services/admin-service';
import { updateSchoolSchema, type UpdateSchoolFormValues } from '@/lib/validators/admin';
import type { SchoolProfile } from '@/types/school';

interface EditSchoolDialogProps {
  school: SchoolProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSchoolDialog({ school, open, onOpenChange }: EditSchoolDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<UpdateSchoolFormValues>({
    resolver: zodResolver(updateSchoolSchema),
    defaultValues: {
      name: '',
      code: '',
      imagekitPublicKey: '',
      imagekitPrivateKey: '',
      imagekitUrlEndpoint: '',
      imagekitFolder: '',
    }
  });

  useEffect(() => {
    if (school && open) {
      form.reset({
        name: school.name,
        code: school.code,
        // Assuming ImageKit fields might be available or not depending on backend
        // We will just initialize them if they exist in the model, or leave blank
      });
    }
  }, [school, open, form]);

  const updateMutation = useMutation({
    mutationFn: (values: UpdateSchoolFormValues) => {
      if (!school) throw new Error('No school selected');
      return adminService.updateSchool(school.id, values);
    },
    onSuccess: () => {
      toast.success('School updated successfully.');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['admin-schools'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Failed to update school');
    }
  });

  const onSubmit = (data: UpdateSchoolFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit School Profile</DialogTitle>
          <DialogDescription>
            Update the institution&apos;s primary details and technical configurations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full School Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="edit-name" 
                  {...form.register('name')} 
                  className="pl-9 h-11"
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-xs text-rose-500 font-medium">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-code">School Code [Read-Only]</Label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="edit-code" 
                  {...form.register('code')} 
                  disabled
                  className="pl-9 h-11 uppercase bg-slate-50 opacity-80"
                />
              </div>
            </div>
          </div>

          <Accordion className="w-full">
            <AccordionItem value="advanced-settings" className="border-slate-200">
              <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:text-indigo-600">
                Advanced Settings (ImageKit Credentials)
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2 space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="edit-ik-pub">Public Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="edit-ik-pub" 
                      {...form.register('imagekitPublicKey')} 
                      placeholder="public_..." 
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-ik-priv">Private Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="edit-ik-priv" 
                      type="password"
                      {...form.register('imagekitPrivateKey')} 
                      placeholder="private_..." 
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-ik-url">URL Endpoint</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="edit-ik-url" 
                      {...form.register('imagekitUrlEndpoint')} 
                      placeholder="https://ik.imagekit.io/..." 
                      className="pl-9"
                    />
                  </div>
                  {form.formState.errors.imagekitUrlEndpoint && (
                    <p className="text-xs text-rose-500 font-medium">{form.formState.errors.imagekitUrlEndpoint.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-ik-folder">Target Folder path</Label>
                  <div className="relative">
                    <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="edit-ik-folder" 
                      {...form.register('imagekitFolder')} 
                      placeholder="e.g. /school/avatars" 
                      className="pl-9"
                    />
                  </div>
                </div>

              </AccordionContent>
            </AccordionItem>
          </Accordion>

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
              className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 shadow-sm"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
