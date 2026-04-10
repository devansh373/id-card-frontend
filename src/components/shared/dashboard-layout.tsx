'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/shared/sidebar';
import type { UserRole } from '@/types/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * DashboardLayout wraps all protected dashboard pages.
 * It checks if the user is authenticated and has a permitted role.
 */
export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (user.mustChangePassword) {
      router.replace('/change-password');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // Redirect to their own dashboard instead of a bare 403
      const ROLE_REDIRECT: Record<UserRole, string> = {
        SUPER_ADMIN: '/super-admin',
        SCHOOL_ADMIN: '/school-admin',
        TEACHER: '/teacher',
        VENDOR: '/vendor',
      };
      router.replace(ROLE_REDIRECT[user.role] ?? '/login');
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  // Show centered loader while session is being bootstrapped
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E293B]" />
          <p className="text-sm text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        {children}
      </main>
    </div>
  );
}
