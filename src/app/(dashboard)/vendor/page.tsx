import { FileStack, Printer, CheckCheck, Clock } from 'lucide-react';

const stats = [
  { label: 'Pending Batches', value: '—', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'In Print', value: '—', icon: Printer, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Completed', value: '—', icon: CheckCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Total Cards', value: '—', icon: FileStack, color: 'text-rose-600', bg: 'bg-rose-50' },
];

export default function VendorDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Vendor Dashboard</h1>
        <p className="text-slate-500 text-sm">Manage your print queue and download PDFs for production.</p>
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
          <h2 className="font-semibold text-[#1E293B] mb-4">Ready to Print</h2>
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            No batches ready for printing
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-[#1E293B] mb-4">Recent Activity</h2>
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            No recent print activity
          </div>
        </div>
      </div>
    </div>
  );
}
