'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  School, 
  Users, 
  Printer, 
  TrendingUp, 
  Loader2, 
  ArrowUpRight, 
   
  Building2,
  Clock
} from 'lucide-react';
import { adminService } from '@/features/admin/services/admin-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SuperAdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getSystemStats(),
  });

  const stats = [
    { 
      label: 'Total Schools', 
      value: data?.stats.totalSchools ?? '—', 
      icon: School, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      label: 'Total Students', 
      value: '—', // The API currently returns totalSchools and activeVendors in 'stats'
      icon: Users, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Active Vendors', 
      value: data?.stats.activeVendors ?? '—', 
      icon: Printer, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      label: 'Cards Generated', 
      value: '—', 
      icon: TrendingUp, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50' 
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
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1E293B]">System Overview</h1>
        <p className="text-slate-500 text-sm">Real-time metrics and recently onboarded institutions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-200 overflow-hidden group hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#1E293B]">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Schools Table */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-base text-[#1E293B]">Recently Onboarded Schools</CardTitle>
              <CardDescription className="text-xs">The last few schools added to the system.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 h-8">
              View All <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">School Name</th>
                    <th className="px-6 py-3 font-semibold">Code</th>
                    <th className="px-6 py-3 font-semibold">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.recentSchools || []).length > 0 ? (
                    data?.recentSchools.map((school) => (
                      <tr key={school.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                             <Building2 className="w-4 h-4 text-indigo-500" />
                          </div>
                          <span className="font-medium text-[#1E293B]">{school.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="font-mono text-[10px]">{school.code}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500 tabular-nums">
                          {school.createdAt ? new Date(school.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                         No recent schools to display. Use the Schools module to onboard institutions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed Placeholder */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
           <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-base text-[#1E293B]">System Notifications</CardTitle>
              <CardDescription className="text-xs">Critical system updates and alerts.</CardDescription>
           </CardHeader>
           <CardContent className="flex-1 p-6 flex flex-col items-center justify-center space-y-3 opacity-60">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                 <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 text-center px-4 leading-relaxed">
                 Real-time activity logs and system notifications will appear here as they are generated by the server.
              </p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}


