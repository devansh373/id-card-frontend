'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/features/auth/services/auth-service';

/**
 * AuthProvider bootstraps the user session on every app load.
 * It pings GET /auth/profile to validate the HTTP-only cookie.
 * If the session is valid, it hydrates the auth store.
 * If not (401), it clears any stale state.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, logout, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const profile = await authService.getProfile();
        setUser(profile);
        // Force password change if backend requires it
        if (profile.mustChangePassword) {
          router.push('/change-password');
        }
      } catch {
        // 401 / network error — clear any stale persisted state
        logout();
      }
    };

    bootstrap();
  }, [setUser, logout, setLoading, router]);

  return <>{children}</>;
}
