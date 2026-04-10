import { redirect } from 'next/navigation';

/**
 * Root page: redirect immediately to /login
 * Auth flow is handled by layouts, not this page.
 */
export default function RootPage() {
  redirect('/login');
}
