'use client';

import { 
  Building2, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { vendorService, type VendorSchool } from '@/features/vendors/services/vendor-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function VendorDashboard() {
  const { data: schoolsData, isLoading } = useQuery({
    queryKey: ['vendor-schools'],
    queryFn: () => vendorService.getAssignedSchools(),
  });

  const schools = schoolsData?.data || [];
  
  // Aggregate stats
  // const totalStudents = schools.reduce((sum: number, s: VendorSchool) => sum + (s.stats?.totalStudents || 0), 0);
  const totalReady = schools.reduce((sum: number, s: VendorSchool) => sum + (s.stats?.readyToPrint || 0), 0);
  const totalPrinted = schools.reduce((sum: number, s: VendorSchool) => sum + (s.stats?.printed || 0), 0);

  const stats = [
    { 
      label: 'Active Schools', 
      value: schools.length, 
      icon: Building2, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      description: 'Schools assigned for printing'
    },
    { 
      label: 'Cards Pending', 
      value: totalReady, 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      description: 'Ready for print generation'
    },
    { 
      label: 'Total Printed', 
      value: totalPrinted, 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      description: 'Successfully delivered cards'
    },
    { 
      label: 'System Load', 
      value: 'Optimal', 
      icon: TrendingUp, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      description: 'Print queue status'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Vendor Portal</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Operational control for card printing and logistics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-9 px-4 border-slate-200 bg-white shadow-sm flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Session 2024-25</span>
          </Badge>
          <Link href="/vendor/print-queue">
            <Button className="bg-[#1e293b] hover:bg-[#334155] shadow-lg shadow-slate-200">
              <Printer className="w-4 h-4 mr-2" />
              Open Print Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden relative">
              <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-110", stat.bg)} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2.5 rounded-xl transition-colors", stat.bg)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-[#1E293B]">{stat.value}</h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                   {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Assignments */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
            <div>
              <CardTitle className="text-lg font-bold text-[#1E293B]">Assigned Schools</CardTitle>
              <CardDescription className="text-xs">Printing status for your partner institutions.</CardDescription>
            </div>
            <Link href="/vendor/schools">
               <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {schools.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-center opacity-60">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                     <AlertCircle className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 max-w-[200px]">No schools assigned for distribution yet.</p>
               </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {schools.slice(0, 5).map((school: VendorSchool) => (
                  <div key={school.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        {school.logoUrl ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={school.logoUrl} 
                              alt={`${school.name} Logo`} 
                              fill
                              className="object-contain rounded-xl" 
                              unoptimized
                            />
                          </div>
                        ) : (
                          <Building2 className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{school.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{school.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">{school.stats?.readyToPrint || 0}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Ready</p>
                      </div>
                      <Link href={`/vendor/print-queue?schoolId=${school.id}`}>
                        <Button size="sm" variant="outline" className="h-8 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                           Open Queue
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
           <Card className="bg-[#1e293b] text-white border-none shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
              <CardContent className="p-6 relative z-10">
                 <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/40">
                    <Printer className="w-5 h-5 text-white" />
                 </div>
                 <h4 className="text-xl font-bold mb-2">Bulk Printing Tip</h4>
                 <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Always verify card previews before generating the final class PDF to avoid color profile mismatches.
                 </p>
                 <Button className="w-full bg-white text-[#1e293b] hover:bg-slate-100 font-bold">
                    Learn Protocol
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-slate-200 shadow-sm">
             <CardHeader className="p-5 pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">System Alerts</CardTitle>
             </CardHeader>
             <CardContent className="p-5 pt-0 space-y-4">
                <div className="flex gap-3 items-start p-3 rounded-lg bg-indigo-50/50 border border-indigo-100/50">
                   <CreditCard className="w-4 h-4 text-indigo-500 mt-0.5" />
                   <div>
                      <p className="text-xs font-bold text-slate-700">Awaiting Approval</p>
                      <p className="text-[10px] text-slate-500 mt-1">120 students in ABC School haven&apos;t approved their photos yet.</p>
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
