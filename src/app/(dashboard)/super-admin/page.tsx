import { School, Users, Printer, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Schools', value: '—', icon: School, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Total Students', value: '—', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Active Vendors', value: '—', icon: Printer, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Cards This Month', value: '—', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
];

export default function SuperAdminDashboard() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Super Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">System-wide overview and management controls.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#1E293B] mt-2">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-[#1E293B] mb-4">Recent Schools</h2>
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Connect API to load data
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-[#1E293B] mb-4">Vendor Onboarding</h2>
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            No pending vendor approvals
          </div>
        </div>
      </div>
    </div>
  );
}
