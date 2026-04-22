'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PermissionsContext, type PermissionsMap } from '@/lib/permissions-context';

type UserPayload = ReturnType<typeof getUser>;

interface Branding {
  nom: string;
  slug: string;
  logo: string | null;
  couleurPrimaire: string | null;
  couleurSecondaire: string | null;
}

const DEFAULT_BRANDING: Branding = {
  nom: 'ERP Industriel',
  slug: '',
  logo: null,
  couleurPrimaire: '#1e3a8a',
  couleurSecondaire: '#4CAF50',
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const tenant = params.tenant as string;
  const [user, setUser] = useState<UserPayload>(null);
  const [permissions, setPermissions] = useState<PermissionsMap | null>(null);
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const u = getUser();
    setUser(u);

    api.get('/groupes/mes-permissions')
      .then((res) => setPermissions(res.data as PermissionsMap))
      .catch(() => setPermissions({}));

    // Charte graphique — endpoint public, pas besoin d'auth
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/tenants/${tenant}/branding`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: Branding | null) => {
        if (!data) return;
        setBranding(data);
        const root = document.documentElement;
        root.style.setProperty('--color-primary',   data.couleurPrimaire   ?? '#1e3a8a');
        root.style.setProperty('--color-secondary',  data.couleurSecondaire ?? '#4CAF50');
      })
      .catch(() => {});
  }, [router, tenant]);

  if (!user || permissions === null) return null;

  return (
    <PermissionsContext.Provider value={permissions}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar tenantSlug={tenant} userRole={user.role} permissions={permissions} branding={branding} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} tenantSlug={tenant} />
          <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6">{children}</main>
        </div>
      </div>
    </PermissionsContext.Provider>
  );
}
