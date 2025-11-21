import AdminLayout from '@/app/admin/layout';

export default function CouponsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}