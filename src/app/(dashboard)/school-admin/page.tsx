import { Users, CreditCard, ImageOff, CheckCircle2 } from 'lucide-react';

const stats = [
  { label: 'Total Students', value: '—', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Cards Ready', value: '—', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Missing Photos', value: '—', icon: ImageOff, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Cards Generated', value: '—', icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
];

export default function SchoolAdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">School Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">Manage your school&apos;s students, setup, and ID card generation.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-[#1E293B] mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            {['Setup School Profile', 'Manage Classes', 'Bulk Generate Cards'].map((action) => (
              <div key={action} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-600">{action}</span>
                <span className="text-xs text-slate-400">→</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-[#1E293B] mb-4">Students Needing Attention</h2>
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Connect API to load data
          </div>
        </div>
      </div>
    </div>
  );
}
