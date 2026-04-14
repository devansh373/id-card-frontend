'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { 
  CreditCard, 
  Search, 
  Loader2, 
  RefreshCcw, 
  Eye, 
  CheckCircle2, 
  Printer, 
  Clock,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import Image from 'next/image';

import { studentService } from '@/features/students/services/student-service';
import { idCardService } from '@/features/id-cards/services/id-card-service';
import type { Student } from '@/types/student';

import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CardPreview } from '@/features/id-cards/components/card-preview';
import { cn } from '@/lib/utils';

export default function SchoolAdminIDCardsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [previewingStudent, setPreviewingStudent] = useState<Student | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-id-cards', page, debouncedSearch],
    queryFn: () => studentService.getStudents({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
    }),
  });

  const generateMutation = useMutation({
    mutationFn: (ids: number[]) => idCardService.generateBulk(ids),
    onSuccess: () => {
      toast.success('Card generation jobs submitted');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-id-cards'] });
    },
    onError: () => toast.error('Failed to trigger generation'),
  });

  const columns: ColumnDef<Student>[] = [
    {
      id: 'select',
      header: 'Select',
      cell: ({ row }) => (
        <input 
          type="checkbox"
          checked={selectedIds.includes(row.original.id)}
          onChange={(e) => {
             if (e.target.checked) setSelectedIds([...selectedIds, row.original.id]);
             else setSelectedIds(selectedIds.filter(id => id !== row.original.id));
          }}
          className="w-4 h-4 rounded border-slate-300 text-indigo-600"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase relative overflow-hidden">
             {row.original.photoUrl ? (
               <Image 
                 src={row.original.photoUrl} 
                 alt={row.original.name}
                 fill
                 className="object-cover rounded-full" 
                 unoptimized
               />
             ) : row.original.name.charAt(0)}
          </div>
          <span className="font-semibold text-slate-700">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'printStatus',
      header: 'Print Status',
      cell: ({ row }) => {
        const status = row.original.printStatus as string;
        const config: Record<string, { label: string; color: string; icon: typeof Clock }> = {
          READY: { label: 'Ready', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
          PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
          PRINTED: { label: 'Printed', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Printer },
        };
        
        const statusConfig = config[status] || { label: status, color: 'bg-slate-50', icon: Clock };
        const Icon = statusConfig.icon;
        
        return (
          <Badge variant="outline" className={cn("font-medium gap-1", statusConfig.color)}>
             <Icon className="w-3 h-3" />
             {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
           <Button variant="ghost" size="sm" onClick={() => setPreviewingStudent(row.original)} className="text-indigo-600 font-bold">
              <Eye className="w-4 h-4 mr-2" /> Preview
           </Button>
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => generateMutation.mutate([row.original.id])}
            disabled={generateMutation.isPending}
           >
              <RefreshCcw className={cn("w-4 h-4 text-slate-400", generateMutation.isPending && "animate-spin")} />
           </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <CreditCard className="w-7 h-7 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-[#1E293B]">ID Card Center</h1>
              <p className="text-slate-500 text-sm">Managing the digital-to-physical distribution lifecycle.</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <Button 
            disabled={selectedIds.length === 0 || generateMutation.isPending}
            onClick={() => generateMutation.mutate(selectedIds)}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold h-11 px-8 rounded-full"
           >
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
              Generate Selected ({selectedIds.length})
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Filter Sidebar */}
         <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl">
               <CardHeader className="p-5 border-b border-slate-50">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Filter className="w-3 h-3" /> Quick Filters
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500">Search Students</label>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <Input 
                          placeholder="Name or ID..." 
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-9 h-10 border-slate-200 text-sm"
                        />
                     </div>
                  </div>
                  <div className="flex flex-col gap-1 pt-4">
                     <Button variant="ghost" size="sm" className="justify-start text-indigo-600 bg-indigo-50 font-bold rounded-lg h-9">
                        <LayoutGrid className="w-4 h-4 mr-2" /> All Students
                     </Button>
                     <Button variant="ghost" size="sm" className="justify-start text-slate-400 hover:text-slate-600 rounded-lg h-9">
                        <Clock className="w-4 h-4 mr-2" /> Pending Approval
                     </Button>
                     <Button variant="ghost" size="sm" className="justify-start text-slate-400 hover:text-slate-600 rounded-lg h-9">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Ready for Print
                     </Button>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-[#1e293b] text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mb-16 -mr-16 blur-2xl" />
               <h4 className="font-bold text-lg mb-2">Printing Pro-Tip</h4>
               <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Cards marked as &apos;READY&apos; are synced in real-time with your assigned vendor&apos;s print queue.
               </p>
               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-2/3" />
               </div>
            </Card>
         </div>

         {/* Main List */}
         <Card className="lg:col-span-3 border-slate-200 shadow-sm rounded-2xl overflow-hidden min-h-[600px] flex flex-col">
            <CardHeader className="px-6 py-5 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/50">
               <div>
                  <CardTitle className="text-base font-bold text-slate-700 uppercase tracking-tight">Active Queue</CardTitle>
                  <CardDescription className="text-[10px] font-medium uppercase text-slate-400">Showing {data?.meta?.total || 0} Records</CardDescription>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg">
                     <List className="w-4 h-4" />
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
               <DataTable 
                columns={columns}
                data={data?.students || []}
                isLoading={isLoading}
                pageCount={data?.meta?.totalPages}
                currentPage={page}
                onPaginationChange={setPage}
               />
            </CardContent>
         </Card>
      </div>

      {/* 3D Preview Global Modal */}
      <Dialog open={!!previewingStudent} onOpenChange={(open) => !open && setPreviewingStudent(null)}>
         <DialogContent className="max-w-[450px] p-0 overflow-hidden bg-transparent border-none shadow-none">
            <AnimatePresence>
               {previewingStudent && (
                 <motion.div
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
                      onDownload={() => generateMutation.mutate([previewingStudent.id])}
                    />
                 </motion.div>
               )}
            </AnimatePresence>
         </DialogContent>
      </Dialog>
    </div>
  );
}
