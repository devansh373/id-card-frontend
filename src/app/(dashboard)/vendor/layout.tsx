import DashboardLayout from '@/components/shared/dashboard-layout';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout allowedRoles={['VENDOR']}>
      {children}
    </DashboardLayout>
  );
}
