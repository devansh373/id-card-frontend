'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/features/auth/services/auth-service';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types/auth';
import {
  LayoutDashboard,
  School,
  Users,
  CreditCard,
  BookOpen,
  UserSquare,
  Printer,
  FileStack,
  LogOut,
  ChevronRight,
  GraduationCap,
  Settings,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS_BY_ROLE: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
    { label: 'Schools', href: '/super-admin/schools', icon: School },
    { label: 'Users', href: '/super-admin/users', icon: Users },
    { label: 'Vendors', href: '/super-admin/vendors', icon: Printer },
  ],
  SCHOOL_ADMIN: [
    { label: 'Dashboard', href: '/school-admin', icon: LayoutDashboard },
    { label: 'School Setup', href: '/school-admin/setup', icon: Settings },
    { label: 'Classes & Sections', href: '/school-admin/classes', icon: BookOpen },
    { label: 'ID Cards', href: '/school-admin/id-cards', icon: CreditCard },
  ],
  TEACHER: [
    { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { label: 'My Students', href: '/teacher/students', icon: Users },
    { label: 'ID Cards', href: '/teacher/id-cards', icon: CreditCard },
  ],
  VENDOR: [
    { label: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
    { label: 'Print Queue', href: '/vendor/print-queue', icon: FileStack },
    { label: 'Schools', href: '/vendor/schools', icon: School },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  VENDOR: 'Vendor',
};

const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-indigo-100 text-indigo-700',
  SCHOOL_ADMIN: 'bg-emerald-100 text-emerald-700',
  TEACHER: 'bg-amber-100 text-amber-700',
  VENDOR: 'bg-rose-100 text-rose-700',
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const navItems = NAV_ITEMS_BY_ROLE[user.role] ?? [];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore — always logout client side
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#1E293B]/95 backdrop-blur-md border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">ID Card System</p>
          <p className="text-slate-400 text-xs">School Management</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
            <UserSquare className="w-5 h-5 text-slate-300" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.email}</p>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', ROLE_COLORS[user.role])}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
        {user.school && (
          <p className="text-slate-400 text-xs mt-2 truncate pl-12">{user.school.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={cn('w-4 h-4 flex-shrink-0 relative z-10', isActive ? 'text-emerald-400' : '')} />
              <span className="relative z-10 flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-emerald-400 relative z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <Button
          id="sidebar-logout"
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 h-10 px-3 rounded-lg font-medium text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
