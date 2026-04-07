'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

type UserPayload = ReturnType<typeof getUser>;

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const tenant = params.tenant as string;
  const [user, setUser] = useState<UserPayload>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setUser(getUser());
  }, [router]);

  // null côté serveur ET côté client avant useEffect → pas de mismatch
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar tenantSlug={tenant} userRole={user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} tenantSlug={tenant} />
        <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6">{children}</main>
      </div>
    </div>
  );
}
