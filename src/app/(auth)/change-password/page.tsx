'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/features/auth/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validators/auth';
import type { UserRole } from '@/types/auth';

const ROLE_REDIRECT: Record<UserRole, string> = {
  SUPER_ADMIN: '/super-admin',
  SCHOOL_ADMIN: '/school-admin',
  TEACHER: '/teacher',
  VENDOR: '/vendor',
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      // Re-fetch profile to clear mustChangePassword flag
      const profile = await authService.getProfile();
      setUser(profile);

      toast.success('Password changed successfully!');
      router.push(ROLE_REDIRECT[profile.role] ?? '/login');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to change password. Please try again.';
      toast.error(message);
    }
  };

  const isForced = user?.mustChangePassword ?? false;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Icon & headline */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isForced ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              {isForced
                ? <ShieldCheck className="w-7 h-7 text-amber-500" />
                : <KeyRound className="w-7 h-7 text-emerald-500" />
              }
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-1">
              {isForced ? 'Password reset required' : 'Change password'}
            </h2>
            <p className="text-slate-500 text-sm max-w-xs">
              {isForced
                ? 'For your security, you must set a new password before continuing.'
                : 'Choose a strong password to protect your account.'}
            </p>
          </div>

          <form id="change-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">
                Current password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`h-11 ${errors.currentPassword ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p className="text-xs text-rose-500">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                New password
              </Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="min. 8 characters"
                className={`h-11 ${errors.newPassword ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-xs text-rose-500">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`h-11 ${errors.confirmPassword ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password rules hint */}
            <ul className="text-xs text-slate-400 space-y-1 bg-slate-50 rounded-lg p-3">
              <li>• At least 8 characters</li>
              <li>• At least one uppercase letter</li>
              <li>• At least one number</li>
            </ul>

            <Button
              type="submit"
              id="change-password-submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#1E293B] hover:bg-[#334155] text-white font-medium rounded-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating…
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
