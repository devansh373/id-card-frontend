'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CreditCard, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/features/auth/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth';
import type { UserRole } from '@/types/auth';

// Maps role to dashboard route
const ROLE_REDIRECT: Record<UserRole, string> = {
  SUPER_ADMIN: '/super-admin',
  SCHOOL_ADMIN: '/school-admin',
  TEACHER: '/teacher',
  VENDOR: '/vendor',
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const loginRes = await authService.login(values);

      if (loginRes.user.mustChangePassword) {
        toast.info('Please change your password to continue.');
        router.push('/change-password');
        return;
      }

      // Fetch full profile to populate the store
      const profile = await authService.getProfile();
      setUser(profile);

      toast.success(`Welcome back!`);
      router.push(ROLE_REDIRECT[loginRes.user.role] ?? '/');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1E293B] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background geometric decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            ID Card System
          </span>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">School Management Platform</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Streamline Your<br />
              <span className="text-emerald-400">School ID Cards</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              From student enrollment to professional ID card printing — manage every step in one cohesive platform.
            </p>
          </motion.div>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col gap-3"
          >
            {[
              { label: 'Bulk card generation', color: 'bg-emerald-500' },
              { label: 'Role-based access control', color: 'bg-indigo-500' },
              { label: 'Vendor print management', color: 'bg-amber-500' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${f.color}`} />
                <span className="text-slate-300 text-sm">{f.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-500 text-xs">© 2026 School ID Card System. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#1E293B] flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-semibold text-[#1E293B]">ID Card System</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1E293B] mb-1">Welcome back</h2>
              <p className="text-slate-500 text-sm">Sign in to access your dashboard</p>
            </div>

            <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`h-11 transition-colors ${errors.email ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`h-11 pr-10 transition-colors ${errors.password ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                id="login-submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#1E293B] hover:bg-[#334155] text-white font-medium rounded-lg transition-all duration-200 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3">
                <div className="shrink-0">
                  <Eye className="w-4 h-4 text-amber-600 mt-0.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-amber-800 leading-tight">
                    Performance Note
                  </p>
                  <p className="text-[10px] text-amber-700 leading-normal">
                    The backend is hosted on a free tier. The first sign-in request may take up to 50 seconds to "wake up" the server. Thank you for your patience!
                  </p>
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400">
                Your session is secured with HTTP-only cookies.
              </p>
            </div>
          </div>

          {/* Role hint — dev only visibility */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Contact your system administrator to obtain your login credentials.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
