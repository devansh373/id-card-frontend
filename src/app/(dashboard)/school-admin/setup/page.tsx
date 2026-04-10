'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Settings, PenTool, Image as ImageIcon, Link as LinkIcon, Building2 } from 'lucide-react';

import { schoolService } from '@/features/schools/services/school-service';
import { 
  generalSetupSchema, 
  signaturesSchema, 
  imageKitSchema,
  type GeneralSetupFormValues,
  type SignaturesFormValues,
  type ImageKitFormValues
} from '@/lib/validators/school';

import { FileUpload } from '@/components/shared/file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SchoolSetupPage() {
  const queryClient = useQueryClient();

  // Fetch school data
  const { data: school, isLoading } = useQuery({
    queryKey: ['school-profile'],
    queryFn: () => schoolService.getSchoolSetup(),
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p>Loading school settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">School Setup</h1>
        <p className="text-slate-500 text-sm">Configure your school profile, branding assets, and external integrations.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 bg-slate-100 p-1 w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-slate-600">
            Profile
          </TabsTrigger>
          <TabsTrigger value="signatures" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-slate-600">
            Signatures
          </TabsTrigger>
          <TabsTrigger value="imagekit" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-slate-600">
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 outline-none">
          <GeneralSetupForm school={school} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-profile'] })} />
        </TabsContent>

        <TabsContent value="signatures" className="mt-0 outline-none">
          <SignaturesForm school={school} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-profile'] })} />
        </TabsContent>

        <TabsContent value="imagekit" className="mt-0 outline-none">
          <ImageKitForm school={school} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['school-profile'] })} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ----------------------------------------------------------------------
// FORM 1: General Setup
// ----------------------------------------------------------------------
function GeneralSetupForm({ school, onSuccess }: { school?: any, onSuccess: () => void }) {
  const form = useForm<GeneralSetupFormValues>({
    resolver: zodResolver(generalSetupSchema),
    defaultValues: {
      name: school?.name || '',
      description: school?.description || '',
      address: school?.address || '',
      contactNumber: school?.contactNumber || '',
      affiliationNumber: school?.affiliationNumber || '',
      registrationNumber: school?.registrationNumber || '',
      registrationDetails: school?.registrationDetails || '',
      logo: [],
      template: [],
    },
  });

  const mutation = useMutation({
    mutationFn: (values: GeneralSetupFormValues) => {
      // payload expects raw files if provided
      const payload = {
        ...values,
        logo: values.logo?.[0] as File | undefined,
        template: values.template?.[0] as File | undefined,
      };
      return schoolService.updateSchoolSetup(payload);
    },
    onSuccess: () => {
      toast.success('School profile updated successfully');
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    }
  });

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-lg text-[#1E293B] flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-500" />
          General Profile
        </CardTitle>
        <CardDescription>Basic information and primary ID card branding.</CardDescription>
      </CardHeader>
      
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1.5 md:col-span-2">
            <Label>School Name</Label>
            <Input {...form.register('name')} placeholder="e.g. Springfield High School" className="h-11" />
            {form.formState.errors.name && <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>Description / Tagline</Label>
            <Input {...form.register('description')} placeholder="Excellence in Education" className="h-11" />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label>Full Address</Label>
            <Input {...form.register('address')} placeholder="123 Education Ave, City, State" className="h-11" />
          </div>

          <div className="space-y-1.5">
            <Label>Contact Number</Label>
            <Input {...form.register('contactNumber')} placeholder="+1 234 567 890" className="h-11" />
          </div>

          <div className="space-y-1.5">
            <Label>Affiliation Number</Label>
            <Input {...form.register('affiliationNumber')} placeholder="AFF-2024" className="h-11" />
          </div>

          <div className="space-y-1.5">
            <Label>Registration Number</Label>
            <Input {...form.register('registrationNumber')} placeholder="REG-12345" className="h-11" />
          </div>

          <div className="space-y-1.5">
            <Label>Registration Details / Board</Label>
            <Input {...form.register('registrationDetails')} placeholder="CBSE / State Board" className="h-11" />
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div>
              <Label className="text-base text-[#1E293B]">School Logo</Label>
              <p className="text-xs text-slate-500 mb-2">Used across the platform and on ID cards.</p>
            </div>
            
            {school?.logoUrl && form.getValues('logo')?.length === 0 && (
              <div className="mb-3 border border-slate-200 rounded-lg p-2 max-w-[120px]">
                <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">Current Logo</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={school.logoUrl} alt="Current logo" className="h-16 object-contain" />
              </div>
            )}
            
            <Controller
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FileUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                  label="Upload New Logo" 
                  description="PNG or JPG, max 5MB"
                />
              )}
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-base text-[#1E293B]">ID Card Background Template</Label>
              <p className="text-xs text-slate-500 mb-2">CR-80 dimensions (1013 x 638 pixels recommended).</p>
            </div>
            
            {school?.templateUrl && form.getValues('template')?.length === 0 && (
              <div className="mb-3 border border-slate-200 rounded-lg p-2 max-w-[120px]">
                <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">Current Template</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={school.templateUrl} alt="Current template" className="h-16 object-contain" />
              </div>
            )}
            
            <Controller
              control={form.control}
              name="template"
              render={({ field }) => (
                <FileUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                  label="Upload ID Template" 
                  description="Vertical or Horizontal frame, max 5MB"
                />
              )}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]">
            {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Profile'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ----------------------------------------------------------------------
// FORM 2: Signatures Setup
// ----------------------------------------------------------------------
function SignaturesForm({ school, onSuccess }: { school?: any, onSuccess: () => void }) {
  const form = useForm<SignaturesFormValues>({
    resolver: zodResolver(signaturesSchema),
    defaultValues: { principal: [], authority: [] },
  });

  const mutation = useMutation({
    mutationFn: (values: SignaturesFormValues) => {
      if (!school?.id) throw new Error("School ID missing.");
      const payload = {
        principal: values.principal?.[0] as File | undefined,
        authority: values.authority?.[0] as File | undefined,
      };
      return schoolService.uploadSignatures(school.id, payload);
    },
    onSuccess: () => {
      toast.success('Signatures uploaded successfully');
      form.reset({ principal: [], authority: [] });
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to upload signatures');
    }
  });

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-lg text-[#1E293B] flex items-center gap-2">
          <PenTool className="w-5 h-5 text-amber-500" />
          Official Signatures
        </CardTitle>
        <CardDescription>Signatures printed on the bottom of the generated ID cards.</CardDescription>
      </CardHeader>
      
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Principal */}
          <div className="space-y-3 bg-slate-50 rounded-xl p-5 border border-slate-100">
            <Label className="text-base text-[#1E293B]">Principal / Director Signature</Label>
            
            {school?.principalSignatureUrl && (
              <div className="mb-4 bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase mb-2">Active Signature</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={school.principalSignatureUrl} alt="Principal Signature" className="h-10 object-contain" />
              </div>
            )}
            
            <Controller
              control={form.control}
              name="principal"
              render={({ field }) => (
                <FileUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                  label="Upload Override" 
                  description="Transparent PNG recommended"
                />
              )}
            />
          </div>

          {/* Authority */}
          <div className="space-y-3 bg-slate-50 rounded-xl p-5 border border-slate-100">
            <Label className="text-base text-[#1E293B]">Issuing Authority Signature</Label>
            
            {school?.authoritySignatureUrl && (
              <div className="mb-4 bg-white border border-slate-200 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase mb-2">Active Signature</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={school.authoritySignatureUrl} alt="Authority Signature" className="h-10 object-contain" />
              </div>
            )}
            
            <Controller
              control={form.control}
              name="authority"
              render={({ field }) => (
                <FileUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                  label="Upload Override" 
                  description="Transparent PNG recommended"
                />
              )}
            />
          </div>

        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending} className="bg-amber-500 text-amber-950 hover:bg-amber-600 min-w-[140px]">
            {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Upload Signatures'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ----------------------------------------------------------------------
// FORM 3: ImageKit Setup
// ----------------------------------------------------------------------
function ImageKitForm({ school, onSuccess }: { school?: any, onSuccess: () => void }) {
  const form = useForm<ImageKitFormValues>({
    resolver: zodResolver(imageKitSchema),
    defaultValues: {
      imagekitPublicKey: school?.imagekitPublicKey || '',
      imagekitPrivateKey: '', // Never pre-filled for security
      imagekitUrlEndpoint: school?.imagekitUrlEndpoint || '',
      imagekitFolder: school?.imagekitFolder || `schools/${school?.id}`,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ImageKitFormValues) => {
      if (!school?.id) throw new Error("School ID missing.");
      return schoolService.updateImageKit(school.id, values);
    },
    onSuccess: () => {
      toast.success('ImageKit integrations updated successfully');
      // Reset private key field explicitly
      form.setValue('imagekitPrivateKey', ''); 
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update integration');
    }
  });

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-lg text-[#1E293B] flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-indigo-500" />
          ImageKit CDN Integration
        </CardTitle>
        <CardDescription>Secure credentials required to upload student photos and process background card generations.</CardDescription>
      </CardHeader>
      
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6 p-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Public Key</Label>
            <Input {...form.register('imagekitPublicKey')} placeholder="public_xxxxxxxxxxxxxxxxxxxxx=" className="h-11 font-mono text-sm" />
            {form.formState.errors.imagekitPublicKey && <p className="text-xs text-rose-500">{form.formState.errors.imagekitPublicKey.message}</p>}
          </div>

          <div className="space-y-1.5 md:col-span-2">
             <Label>Private Key <span className="text-rose-500">*</span></Label>
             <Input type="password" {...form.register('imagekitPrivateKey')} placeholder="private_xxxxxxxxxxxxxxxxxxxx=" className="h-11 font-mono text-sm" />
             <p className="text-xs text-amber-600 mt-1">Requires re-entry for security when making any updates.</p>
             {form.formState.errors.imagekitPrivateKey && <p className="text-xs text-rose-500">{form.formState.errors.imagekitPrivateKey.message}</p>}
          </div>

          <div className="space-y-1.5">
             <Label>URL Endpoint</Label>
             <Input {...form.register('imagekitUrlEndpoint')} placeholder="https://ik.imagekit.io/your_id" className="h-11 font-mono text-sm" />
             {form.formState.errors.imagekitUrlEndpoint && <p className="text-xs text-rose-500">{form.formState.errors.imagekitUrlEndpoint.message}</p>}
          </div>
          
          <div className="space-y-1.5">
             <Label>Target Storage Folder</Label>
             <Input {...form.register('imagekitFolder')} placeholder="schools/1" className="h-11 font-mono text-sm" />
             {form.formState.errors.imagekitFolder && <p className="text-xs text-rose-500">{form.formState.errors.imagekitFolder.message}</p>}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={mutation.isPending} className="bg-[#1E293B] hover:bg-[#334155] min-w-[140px]">
            {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Integration'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
