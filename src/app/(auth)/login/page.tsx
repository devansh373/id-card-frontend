'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CreditCard, GraduationCap, UserCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/features/auth/services/auth-service';
import { useAuthStore } from '@/store/auth-store';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth';
import type { UserRole } from '@/types/auth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: "spring" as const,
      stiffness: 100,
      damping: 20
    },
  },
};

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

  // 🖱️ Mouse tracking for 3D Parallax & Glow
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  // const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

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

  const handleGuestLogin = () => {
    const guestEmail = process.env.NEXT_PUBLIC_GUEST_EMAIL || '';
    const guestPassword = process.env.NEXT_PUBLIC_GUEST_PASSWORD || '';
    
    // Submit directly without populating the form
    onSubmit({ email: guestEmail, password: guestPassword });
  };

  return (
    <div className="min-h-screen flex bg-slate-950 selection:bg-emerald-500/30 overflow-hidden relative">
      {/* ── Dynamic Mesh Background ── */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500 blur-[80px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[80px] animate-pulse [animation-delay:2s]" />
      </div>
      {/* ── Left: Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1E293B] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background geometric decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600 blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-emerald-500 blur-2xl" 
          />
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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">School Management Platform</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl font-extrabold text-white leading-tight mb-4 tracking-tighter">
              Streamline Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">School ID Cards</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400 text-base leading-relaxed max-w-sm">
              From student enrollment to professional ID card printing — manage every step in one cohesive platform.
            </motion.p>

            {/* Feature badges */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-10 flex flex-col gap-3"
            >
              {[
                { label: 'Bulk card generation', color: 'bg-emerald-500' },
                { label: 'Role-based access control', color: 'bg-indigo-500' },
                { label: 'Vendor print management', color: 'bg-amber-500' },
              ].map((f) => (
                <motion.div key={f.label} variants={itemVariants} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${f.color}`} />
                  <span className="text-slate-300 text-sm">{f.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-500 text-xs">© 2026 School ID Card System. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div 
        className="flex-1 flex items-center justify-center p-6 relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 💠 Floating hollow shapes (Scoped to Right Panel - Behind Card) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 0],
            }}
            transition={{ 
              duration: 12 + (i * 2), 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 1 
            }}
            className="absolute text-white pointer-events-none opacity-40 z-0"
            style={{ 
              left: `${(i * 20 + 10) % 100}%`, 
              top: `${(i * 25 + 5) % 100}%`,
            }}
          >
            {i % 2 === 0 ? (
              <div className="w-8 h-8 border-4 border-white rounded-lg" />
            ) : (
              <div className="w-8 h-8 border-4 border-white rounded-full" />
            )}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="group relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white p-10 overflow-hidden"
          >
            {/* 🔦 High-Visibility Magnetic Glow Effect */}
            <motion.div 
              style={{
                background: useTransform(
                  [mouseXSpring, mouseYSpring],
                  ([x, y]) => `radial-gradient(250px circle at ${(Number(x) + 0.5) * 100}% ${(Number(y) + 0.5) * 100}%, rgba(134, 57, 235, 0.19), transparent 80%)`
                )
              }}
              className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />

            <motion.div variants={itemVariants} className="relative z-10 mb-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-950 text-emerald-400 mb-4 shadow-2xl ring-1 ring-white/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 text-sm mt-2">Enter credentials to unlock secure session</p>
            </motion.div>

            <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-1.5">
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
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-1.5">
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
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  id="login-submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#1E293B] hover:bg-[#334155] text-white font-medium rounded-lg transition-all duration-200 mt-2 active:scale-95"
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
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400">Or preview the project</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="button"
                id="guest-login-submit"
                onClick={handleGuestLogin}
                className="w-full h-11 border-slate-200 text-slate-50 hover:bg-slate-50 hover:text-slate-900 border transition-all font-medium rounded-lg active:scale-95"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Access as Guest
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3">
                <div className="shrink-0">
                  <Eye className="w-4 h-4 text-amber-600 mt-0.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-amber-800 leading-tight">
                    Performance Note
                  </p>
                  <p className="text-[10px] text-amber-700 leading-normal">
                    The backend is hosted on a free tier. The first sign-in request may take up to 50 seconds to &quot;wake up&quot; the server. Thank you for your patience!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Role hint — dev only visibility */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Contact your system administrator to obtain your login credentials.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
