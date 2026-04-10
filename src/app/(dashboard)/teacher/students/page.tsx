'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import { Search, Upload, UserX, User2, ImagePlus, Loader2, FileSpreadsheet } from 'lucide-react';

import { studentService } from '@/features/students/services/student-service';
import type { Student } from '@/types/student';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { FileUpload } from '@/components/shared/file-upload';

export default function TeacherStudentsPage() {
  const queryClient = useQueryClient();

  // --- Search & Pagination State ---
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // We could implement class/section filters if needed, but for now we'll stick to search for brevity.
  // We run pagination server-side by passing the `page` state to React Query.
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['students', page, debouncedSearch],
    queryFn: () => studentService.getStudents({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
    }),
    placeholderData: (prev) => prev, // keeps previous data while fetching next page to prevent flashing
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
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Upload failed')
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
      accessorKey: 'aparIdOrPan',
      header: 'ID / Roll No',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700">{row.original.aparIdOrPan}</span>
          <span className="text-xs text-slate-500">{row.original.rollNo || 'No Roll #'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Student Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.original.photoUrl} alt={row.original.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
               <User2 className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <span className="font-medium text-[#1E293B]">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: 'class_section',
      header: 'Class & Section',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-normal">
          {row.original.class?.name || 'Unassigned'} - {row.original.section?.name || 'Unassigned'}
        </Badge>
      ),
    },
    {
      accessorKey: 'photoStatus',
      header: 'Photo Status',
      cell: ({ row }) => {
        const status = row.original.photoStatus;
        if (status === 'APPROVED') return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
        if (status === 'UPLOADED') return <Badge className="bg-indigo-500 hover:bg-indigo-600">Uploaded</Badge>;
        return <Badge variant="secondary" className="text-amber-700 bg-amber-100/50 hover:bg-amber-100">Missing</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <PhotoUploadCell student={row.original} />
        </div>
      )
    }
  ];

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col h-full gap-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Student Management</h1>
          <p className="text-slate-500 text-sm">Manage student profiles, bulk uploads, and ID card photographs.</p>
        </div>

        <Dialog>
          <DialogTrigger>
            <Button className="bg-[#1E293B] hover:bg-[#334155] gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Bulk CSV Import
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Students</DialogTitle>
              <DialogDescription>
                Upload a CSV file containing your student roster. Ensure the headers exactly match the system specification.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex flex-col gap-4">
              <FileUpload label="Select CSV File" description="Max size 5MB" accept={{ 'text/csv': ['.csv'] }} />
              <Button variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                Download Sample CSV Template
              </Button>
            </div>
            <div className="flex justify-end">
               {/* To be connected to an actual bulk import endpoint later */}
               <Button className="bg-emerald-600 hover:bg-emerald-700 w-full" onClick={() => toast.info("CSV validation pipeline in development")}>Process Import</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Card Area */}
      <Card className="flex-1 border-slate-200 shadow-sm flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by name, roll no, or ID..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // reset to page 1 on search
              }}
              className="pl-9 h-10 border-slate-200 bg-white"
            />
          </div>
          
          {isFetching && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
        </div>
        
        {/* Table & Empty States Container */}
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
                ? "No students match your search criteria." 
                : "No students registered yet. Try importing a CSV roster."
            }
          />
        </CardContent>
      </Card>

    </div>
  );
}
