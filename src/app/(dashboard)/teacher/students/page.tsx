'use client';

import { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { 
  Search,  
  User2, 
  ImagePlus, 
  Loader2, 
  FileSpreadsheet, 
  Eye, 
  RefreshCcw, 
  ShieldCheck, 
  Printer,
  
  Clock, 
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { studentService } from '@/features/students/services/student-service';
import { idCardService } from '@/features/id-cards/services/id-card-service';
import type { Student } from '@/types/student';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { FileUpload } from '@/components/shared/file-upload';
import { CardPreview } from '@/features/id-cards/components/card-preview';
import { cn } from '@/lib/utils';

export default function TeacherStudentsPage() {
  const queryClient = useQueryClient();

  // --- Search & Pagination State ---
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewingStudent, setPreviewingStudent] = useState<Student | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['students', page, debouncedSearch],
    queryFn: () => studentService.getStudents({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
    }),
    placeholderData: (prev) => prev,
  });

  // --- Mutations ---
  const bulkGenerateMutation = useMutation({
    mutationFn: (ids: number[]) => idCardService.generateBulk(ids),
    onSuccess: (res) => {
      toast.success(res.message);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Bulk generation failed to start'),
  });

  const singleGenerateMutation = useMutation({
    mutationFn: (id: number) => idCardService.generateSingle(id),
    onSuccess: () => {
      toast.success('ID card generated successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Generation failed'),
  });

  // --- Photo Upload Component Embedded in Cell ---
  const PhotoUploadCell = ({ student }: { student: Student }) => {
    const [file, setFile] = useState<File[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    
    const mutation = useMutation({
      mutationFn: (f: File) => studentService.uploadPhoto(student.id, f),
      onSuccess: () => {
        toast.success(`Photo uploaded for ${student.name}`);
        setIsOpen(false);
        setFile([]);
        queryClient.invalidateQueries({ queryKey: ['students'] });
      },
      onError: (err: unknown) => {
        if (axios.isAxiosError<{ message: string }>(err)) {
          toast.error(err.response?.data?.message || 'Upload failed');
        } else {
          toast.error('An unexpected error occurred');
        }
      }
    });

    const handleSave = () => {
      if (file[0]) mutation.mutate(file[0]);
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
             <ImagePlus className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
            <DialogDescription>Select a clear front-facing passport style photo for {student.name}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <FileUpload value={file} onChange={setFile} description="JPG/PNG, max 5MB (Passport Size)" />
          </div>
          <div className="flex justify-end">
             <Button onClick={handleSave} disabled={file.length === 0 || mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
               {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Photo
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // --- Columns ---
  const columns: ColumnDef<Student>[] = [
    {
      id: 'select',
      header: 'Select',
      cell: ({ row }) => (
        <input 
          type="checkbox"
          checked={selectedIds.includes(row.original.id)}
          onChange={(e) => {
             if (e.target.checked) {
               setSelectedIds([...selectedIds, row.original.id]);
             } else {
               setSelectedIds(selectedIds.filter(id => id !== row.original.id));
             }
          }}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Student Profile',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative">
             {row.original.photoUrl ? (
               <div className="relative w-9 h-9">
                 <Image 
                   src={row.original.photoUrl} 
                   alt={row.original.name} 
                   fill
                   className="rounded-full object-cover border border-slate-200" 
                   unoptimized
                 />
               </div>
             ) : (
               <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <User2 className="w-5 h-5 text-slate-400" />
               </div>
             )}
             {row.original.photoStatus === 'APPROVED' && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                   <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
             )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#1E293B] text-sm">{row.original.name}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{row.original.aparIdOrPan}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'class_section',
      header: 'Placement',
      cell: ({ row }) => (
        <div className="flex flex-col">
           <span className="text-xs font-bold text-slate-600">Class {row.original.class?.name}</span>
           <span className="text-[10px] text-slate-400">{row.original.section?.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'printStatus',
      header: 'Card Cycle',
      cell: ({ row }) => {
        const status = row.original.printStatus as string;
        const config: Record<string, { label: string; color: string; icon: typeof Clock }> = {
          PENDING: { label: 'Pending Gen', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
          READY: { label: 'Ready to Print', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Printer },
          PRINTED: { label: 'Handed to Delivery', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
          DELIVERED: { label: 'Distributed', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: GraduationCap },
        };

        const statusConfig = config[status] || { label: status, color: 'bg-slate-50', icon: Clock };
        const Icon = statusConfig.icon || Clock;
        
        return (
          <Badge variant="outline" className={cn("font-medium gap-1 px-2", statusConfig.color)}>
             <Icon className="w-3 h-3" />
             {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Manage</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {row.original.photoStatus === 'APPROVED' ? (
            <div className="flex items-center gap-1">
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPreviewingStudent(row.original)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold"
               >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
               </Button>
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => singleGenerateMutation.mutate(row.original.id)}
                disabled={singleGenerateMutation.isPending}
                className="text-slate-400 hover:text-emerald-600"
               >
                  <RefreshCcw className={cn("w-4 h-4", singleGenerateMutation.isPending && "animate-spin")} />
               </Button>
            </div>
          ) : (
            <PhotoUploadCell student={row.original} />
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col h-full gap-8">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Active Roster</h1>
          <p className="text-slate-500 text-sm mt-1">Institutional database for student identities and card lifecycle.</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-10 px-4 bg-white shadow-sm border-slate-200 text-slate-500 font-bold hidden sm:flex">
             {data?.meta?.total || 0} Registered Students
          </Badge>
          <Dialog>
            <DialogTrigger>
              <Button className="bg-[#1E293B] hover:bg-[#334155] shadow-lg shadow-slate-200 h-10 px-6 font-bold">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Quick Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>CSV Roster Import</DialogTitle>
                <DialogDescription>
                  Bulk upload institutional identity records from your school system.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 flex flex-col gap-6">
                <FileUpload label="Select CSV File" description="Max 5,000 records per file" accept={{ 'text/csv': ['.csv'] }} />
                <Button variant="outline" className="w-full text-indigo-600 border-indigo-100 hover:bg-indigo-50 font-bold">
                  Download Standard Schema Template
                </Button>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full h-11 font-bold" onClick={() => toast.info("Data validation pipeline running...")}>Initialize Import</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Table Interface */}
      <Card className="border-slate-200 shadow-sm flex flex-col min-h-[600px] overflow-hidden rounded-2xl">
        {/* Advanced Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:max-w-xl">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <Input 
                 placeholder="Filter by name, identifier, roll #..." 
                 value={searchTerm}
                 onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setPage(1);
                 }}
                 className="pl-9 h-11 border-slate-200 bg-white shadow-sm focus:ring-indigo-500"
               />
             </div>
             
             {selectedIds.length > 0 && (
               <motion.div
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center gap-2"
               >
                  <Button 
                   onClick={() => bulkGenerateMutation.mutate(selectedIds)}
                   disabled={bulkGenerateMutation.isPending}
                   className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-lg shadow-indigo-100 font-bold ring-4 ring-indigo-50"
                  >
                     {bulkGenerateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                     Generate Batch ({selectedIds.length})
                  </Button>
                  <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => setSelectedIds([])}
                   className="text-slate-400 hover:text-rose-500"
                  >
                     Clear
                  </Button>
               </motion.div>
             )}
          </div>
          
          <div className="flex items-center gap-2">
             {isFetching && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
             <Badge variant="outline" className="text-[10px] font-mono border-slate-200 text-slate-400">PAGE {page}</Badge>
          </div>
        </div>
        
        {/* Data Table */}
        <CardContent className="p-0 flex-1 flex flex-col">
          <DataTable 
            columns={columns}
            data={data?.students || []}
            isLoading={isLoading}
            pageCount={data?.meta?.totalPages}
            currentPage={page}
            onPaginationChange={setPage}
            emptyMessage={
              searchTerm 
                ? "No institutional records found for this query." 
                : "The student roster is currently empty."
            }
          />
        </CardContent>
      </Card>

      {/* 3D Preview Global Modal */}
      <Dialog open={!!previewingStudent} onOpenChange={(open) => !open && setPreviewingStudent(null)}>
         <DialogContent className="max-w-[450px] p-0 overflow-hidden bg-transparent border-none shadow-none">
            <AnimatePresence>
               {previewingStudent && (
                 <motion.div
                   key={previewingStudent.id}
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 >
                    <CardPreview 
                      card={{
                        studentId: previewingStudent.id,
                        name: previewingStudent.name,
                        status: previewingStudent.printStatus === 'READY' ? 'READY' : 'NOT_READY',
                        frontUrl: previewingStudent.photoUrl || undefined,
                        backUrl: undefined
                      }}
                      onDownload={() => singleGenerateMutation.mutate(previewingStudent.id)}
                    />
                 </motion.div>
               )}
            </AnimatePresence>
         </DialogContent>
      </Dialog>

    </div>
  );
}
