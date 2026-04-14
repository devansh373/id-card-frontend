'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Search,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { vendorService, type VendorSchool } from '@/features/vendors/services/vendor-service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';

export default function VendorSchoolsPage() {
  const [search, setSearch] = useState('');
  
  const { data: schoolsData, isLoading } = useQuery({
    queryKey: ['vendor-schools-list'],
    queryFn: () => vendorService.getAssignedSchools(),
  });

  const schools = (schoolsData?.data || []).filter((s: VendorSchool) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Partner Schools</h1>
          <p className="text-slate-500 text-sm">Managing printing logistics for {schools.length} institutions.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search school name or code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 border-slate-200 bg-white shadow-sm focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school: VendorSchool) => (
          <Card key={school.id} className="border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner overflow-hidden">
                  {school.logoUrl ? (
                    <img src={school.logoUrl} className="w-full h-full object-contain" alt={school.name} />
                  ) : (
                    <Building2 className="w-7 h-7 text-slate-300" />
                  )}
                </div>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-2.5 py-1">
                   {school.code}
                </Badge>
              </div>

              <div className="space-y-3 mb-8">
                 <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                    {school.name}
                 </h3>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                       <MapPin className="w-3.5 h-3.5 opacity-60" />
                       Address Details Not Listed
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                       <Phone className="w-3.5 h-3.5 opacity-60" />
                       No registered contact
                    </div>
                 </div>
              </div>

              {/* Printing Progress */}
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Printing Status</span>
                    <span className="text-sm font-bold text-indigo-600">
                       {school.stats?.printed || 0} / {school.stats?.totalStudents || 0}
                    </span>
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, ((school.stats?.printed || 0) / (school.stats?.totalStudents || 1)) * 100)}%` }}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ready</p>
                       <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5 focus:outline-none">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {school.stats?.readyToPrint || 0}
                       </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pending</p>
                       <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5 focus:outline-none">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {school.stats?.pendingPhotos || 0}
                       </p>
                    </div>
                 </div>
              </div>

              <Link href={`/vendor/print-queue?schoolId=${school.id}`} className="block">
                <Button className="w-full bg-[#1e293b] hover:bg-indigo-600 shadow-lg shadow-slate-200 h-11 font-bold group">
                   Access Print Queue
                   <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {schools.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-70">
           <Building2 className="w-20 h-20 text-slate-200 mb-6" />
           <p className="text-xl font-bold text-slate-400">No matching schools found.</p>
           <p className="text-sm text-slate-400 mt-2">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}
