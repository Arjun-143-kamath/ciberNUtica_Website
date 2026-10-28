import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!await getAdminSession()) redirect('/login?next=/admin');
  return children;
}
