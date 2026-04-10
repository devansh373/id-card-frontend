'use client';

import { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2, ArrowRight, Loader2, BookOpen, Layers } from 'lucide-react';

import { academicService } from '@/features/academic/services/academic-service';
import { classSchema, sectionSchema, type ClassFormValues, type SectionFormValues } from '@/lib/validators/academic';
import type { Class, Section } from '@/types/academic';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AcademicSetupPage() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // --- Classes Query ---
  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicService.getClasses(),
  });

  // --- Sections Query ---
  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections', selectedClassId],
    queryFn: () => academicService.getSections(selectedClassId!),
    enabled: !!selectedClassId,
  });

  // --- Mutations ---
  const createClassMutation = useMutation({
    mutationFn: (values: ClassFormValues) => academicService.createClass(values),
    onSuccess: () => {
      toast.success('Class created successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError<{ message: string }>(err)) {
        toast.error(err.response?.data?.message || 'Failed to create class');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const deleteClassMutation = useMutation({
    mutationFn: (classId: number) => academicService.deleteClass(classId),
    onSuccess: (_, deletedId) => {
      toast.success('Class deleted successfully');
      if (selectedClassId === deletedId) setSelectedClassId(null);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError<{ message: string }>(err)) {
        toast.error(err.response?.data?.message || 'Failed to delete class');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const createSectionMutation = useMutation({
    mutationFn: (values: SectionFormValues) => academicService.createSection(selectedClassId!, values),
    onSuccess: () => {
      toast.success('Section created successfully');
      queryClient.invalidateQueries({ queryKey: ['sections', selectedClassId] });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError<{ message: string }>(err)) {
        toast.error(err.response?.data?.message || 'Failed to create section');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: number) => academicService.deleteSection(selectedClassId!, sectionId),
    onSuccess: () => {
      toast.success('Section deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sections', selectedClassId] });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError<{ message: string }>(err)) {
        toast.error(err.response?.data?.message || 'Failed to delete section');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  });

  // --- Forms ---
  const classForm = useForm<ClassFormValues>({ resolver: zodResolver(classSchema) });
  const sectionForm = useForm<SectionFormValues>({ resolver: zodResolver(sectionSchema) });

  const onClassSubmit = (values: ClassFormValues) => createClassMutation.mutate(values, { onSuccess: () => classForm.reset() });
  const onSectionSubmit = (values: SectionFormValues) => createSectionMutation.mutate(values, { onSuccess: () => sectionForm.reset() });

  // --- Columns Definitions ---
  const classColumns: ColumnDef<Class>[] = [
    {
      accessorKey: 'name',
      header: 'Class Name',
      cell: ({ row }) => <span className="font-medium text-[#1E293B]">{row.original.name}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
           <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedClassId(row.original.id)}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            Manage Sections
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete format {row.original.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the class and all its associated sections and students.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteClassMutation.mutate(row.original.id)} className="bg-rose-600 hover:bg-rose-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const sectionColumns: ColumnDef<Section>[] = [
    {
      accessorKey: 'name',
      header: 'Section Name',
      cell: ({ row }) => <span className="font-medium text-[#1E293B]">{row.original.name}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Section {row.original.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the section and decouple its associated students.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteSectionMutation.mutate(row.original.id)} className="bg-rose-600 hover:bg-rose-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const selectedClassDetails = classes?.find(c => c.id === selectedClassId);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Academic Setup</h1>
        <p className="text-slate-500 text-sm">Manage the academic structure of your school: classes and sections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Classes Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b border-slate-100 py-4">
            <div>
              <CardTitle className="text-base text-[#1E293B] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Classes List
              </CardTitle>
              <CardDescription className="text-xs">Select a class to manage its sections.</CardDescription>
            </div>
            
            <Dialog>
              <DialogTrigger>
                <Button size="sm" className="bg-[#1E293B] hover:bg-[#334155]">
                  <Plus className="w-4 h-4 mr-1" /> Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={classForm.handleSubmit(onClassSubmit)} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label>Class Name (e.g. &quot;Grade 10&quot;, &quot;X&quot;, &quot;Senior&quot;)</Label>
                    <Input {...classForm.register('name')} placeholder="Enter class name" autoFocus />
                    {classForm.formState.errors.name && <p className="text-xs text-rose-500">{classForm.formState.errors.name.message}</p>}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={createClassMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                      {createClassMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable 
              columns={classColumns} 
              data={classes || []} 
              isLoading={isLoadingClasses} 
              emptyMessage="No classes created yet. Add one to get started." 
            />
          </CardContent>
        </Card>

        {/* Sections Card */}
        <Card className={`border-slate-200 shadow-sm transition-opacity duration-300 ${selectedClassId ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <CardHeader className="flex flex-row items-center justify-between bg-slate-50 border-b border-slate-100 py-4">
            <div>
              <CardTitle className="text-base text-[#1E293B] flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                {selectedClassId ? `Sections for ${selectedClassDetails?.name}` : 'Sections List'}
              </CardTitle>
              <CardDescription className="text-xs">Splits the class into manageable groups.</CardDescription>
            </div>

            <Dialog>
              <DialogTrigger>
                <Button size="sm" className="bg-[#1E293B] hover:bg-[#334155]" disabled={!selectedClassId}>
                  <Plus className="w-4 h-4 mr-1" /> Add Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Section to {selectedClassDetails?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={sectionForm.handleSubmit(onSectionSubmit)} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label>Section Name (e.g. &quot;A&quot;, &quot;Blue&quot;, &quot;Science&quot;)</Label>
                    <Input {...sectionForm.register('name')} placeholder="Enter section name" autoFocus />
                    {sectionForm.formState.errors.name && <p className="text-xs text-rose-500">{sectionForm.formState.errors.name.message}</p>}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={createSectionMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                      {createSectionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            {selectedClassId ? (
              <DataTable 
                columns={sectionColumns} 
                data={sections || []} 
                isLoading={isLoadingSections} 
                emptyMessage={`No sections found for ${selectedClassDetails?.name}.`} 
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                Select a class on the left to view its sections.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
