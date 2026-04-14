'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { 
  Printer, 
  Search, 
  Loader2, 
  FileDown, 
   
  Building2,
  Users,
  AlertCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import { vendorService } from '@/features/vendors/services/vendor-service';
import { idCardService } from '@/features/id-cards/services/id-card-service';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle,  } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CardPreview } from '@/features/id-cards/components/card-preview';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorPrintQueuePage() {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams.get('schoolId');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [previewingStudent, setPreviewingStudent] = useState<Student | null>(null);

  // --- Data Fetching ---
  const { data: schoolsData } = useQuery({
    queryKey: ['vendor-schools'],
    queryFn: () => vendorService.getAssignedSchools(),
  });

  const selectedSchoolId = schoolIdParam ? parseInt(schoolIdParam) : null;
  const selectedSchool = schoolsData?.data.find(s => s.id === selectedSchoolId);

  const { data: queueData, isLoading } = useQuery({
    queryKey: ['print-queue', selectedSchoolId],
    queryFn: () => selectedSchoolId ? vendorService.getPrintQueue(selectedSchoolId) : Promise.resolve({ data: [] }),
    enabled: !!selectedSchoolId,
  });

  const students = (queueData?.data || []).filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.aparIdOrPan.toLowerCase().includes(search.toLowerCase())
  );

  // --- Mutations ---
  const printMutation = useMutation({
    mutationFn: (ids: number[]) => idCardService.printCards(ids),
    onSuccess: (res) => {
      toast.success('Print PDF generated successfully!');
      window.open(res.pdfUrl, '_blank');
    },
    onError: () => toast.error('Failed to generate print PDF'),
  });

  const markPrintedMutation = useMutation({
    mutationFn: (ids: number[]) => vendorService.markAsPrinted(ids),
    onSuccess: () => {
      toast.success('Marked as printed');
      setSelectedStudents([]);
      queryClient.invalidateQueries({ queryKey: ['print-queue'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  // --- Table Configuration ---
  const columns: ColumnDef<Student>[] = [
    {
      id: 'select',
      header: 'Select',
      cell: ({ row }) => (
        <input 
          type="checkbox"
          checked={selectedStudents.includes(row.original.id)}
          onChange={(e) => {
             if (e.target.checked) {
               setSelectedStudents([...selectedStudents, row.original.id]);
             } else {
               setSelectedStudents(selectedStudents.filter(id => id !== row.original.id));
             }
          }}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Student Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
             {row.original.photoUrl ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={row.original.photoUrl} 
                    alt={row.original.name}
                    fill
                    className="object-cover" 
                    unoptimized
                  />
                </div>
             ) : (
                <Users className="w-4 h-4 text-slate-400" />
             )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">{row.original.name}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{row.original.aparIdOrPan}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'class',
      header: 'Academic Info',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-slate-600">Class {row.original.class?.name}</span>
          <span className="text-[10px] text-slate-400">{row.original.section?.name}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right whitespace-nowrap">Quick Preview</div>,
      cell: ({ row }) => (
        <div className="flex justify-end pr-2">
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPreviewingStudent(row.original)}
            className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 font-bold"
           >
              <Eye className="w-4 h-4 mr-2" />
              Preview Card
           </Button>
        </div>
      ),
    },
  ];

  if (!selectedSchoolId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[600px] text-center gap-6">
         <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
            <Building2 className="w-8 h-8 text-slate-300" />
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Select a School</h2>
            <p className="text-slate-500 max-w-sm mx-auto text-sm">Please select a school from your dashboard or assigned schools list to manage the print queue.</p>
         </div>
         <Link href="/vendor/schools">
           <Button className="bg-[#1e293b] rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all font-bold">
              Browse Assigned Schools
           </Button>
         </Link>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header Widget */}
      <div className="bg-[#1e293b] text-white rounded-[24px] p-8 shadow-2xl relative overflow-hidden group border border-white/5">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                  <Printer className="w-8 h-8 text-emerald-400" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight">{selectedSchool?.name || 'Loading...'}</h1>
                  <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">Print Queue Workspace</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Queue</p>
                  <p className="text-2xl font-bold text-white leading-tight">{students.length} Cards</p>
               </div>
               <Button 
                onClick={() => printMutation.mutate(selectedStudents)}
                disabled={selectedStudents.length === 0 || printMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 h-12 rounded-full shadow-lg shadow-emerald-500/20 group h-12"
               >
                  {printMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" />}
                  Generate Batch PDF
               </Button>
            </div>
         </div>
      </div>

      {/* Main Table Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <Card className="lg:col-span-3 border-slate-200 shadow-sm min-h-[500px] bg-white rounded-2xl overflow-hidden flex flex-col">
            <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
               <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search queue by student name or ID..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-11 border-slate-200 bg-white"
                  />
               </div>
               <div className="flex items-center gap-3">
                  <Badge variant="outline" className="h-11 px-4 border-slate-100 bg-white text-slate-500 font-bold">
                    {selectedStudents.length} Selected
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedStudents(students.map(s => s.id))}
                    className="text-xs font-bold text-indigo-600"
                  >
                    Select All
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
               <DataTable 
                columns={columns}
                data={students}
                isLoading={isLoading}
                emptyMessage="No students in the printing queue for this school."
               />
            </CardContent>
         </Card>

         <div className="space-y-6">
            {/* Batch Status Card */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
               <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace Controls</CardTitle>
               </CardHeader>
               <CardContent className="p-5 pt-0 space-y-4">
                  <Button 
                    disabled={selectedStudents.length === 0 || markPrintedMutation.isPending}
                    onClick={() => markPrintedMutation.mutate(selectedStudents)}
                    variant="outline" 
                    className="w-full h-12 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100 font-bold transition-all"
                  >
                     <FileCheck className="w-4 h-4 mr-2" />
                     Mark as Printed
                  </Button>
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50 space-y-3">
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Pro Tip</p>
                     <div className="flex gap-2 items-start text-xs text-slate-500 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p>Generate the PDF first, verify it on-screen, then use &apos;Mark as Printed&apos; to update the system records.</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Queue Breakdown Widget */}
            <Card className="border-slate-200 shadow-sm rounded-2xl p-6 bg-gradient-to-br from-indigo-50/50 to-white">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-indigo-100">
                     <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-slate-800">Queue Metrics</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-slate-500 font-medium">Ready to Generate</span>
                     <Badge variant="outline" className="h-6 px-2 bg-white text-indigo-600 border-indigo-100 font-bold">{students.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs text-slate-500 font-medium">Missing Photos</span>
                     <Badge variant="outline" className="h-6 px-2 bg-white text-slate-400 border-slate-100 font-bold">{selectedSchool?.stats?.pendingPhotos || 0}</Badge>
                  </div>
               </div>
            </Card>
         </div>
      </div>

      {/* Card Preview Dialog */}
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
                        status: 'READY',
                        frontUrl: previewingStudent.photoUrl || undefined,
                        backUrl: undefined
                      }}
                      onDownload={() => printMutation.mutate([previewingStudent.id])}
                    />
                 </motion.div>
               )}
            </AnimatePresence>
         </DialogContent>
      </Dialog>
    </div>
  );
}
