import { Users, CreditCard, ImageOff, Upload } from 'lucide-react';

const stats = [
  { label: 'My Students', value: '—', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Cards Ready', value: '—', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Missing Photos', value: '—', icon: ImageOff, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Uploads Today', value: '—', icon: Upload, color: 'text-rose-600', bg: 'bg-rose-50' },
];

export default function TeacherDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Teacher Dashboard</h1>
        <p className="text-slate-500 text-sm">Manage your class students and update their information.</p>
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

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-[#1E293B] mb-4">My Students</h2>
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
          Select a class and section to view students
        </div>
      </div>
    </div>
  );
}
