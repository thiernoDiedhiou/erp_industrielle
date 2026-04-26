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
  const [activeModules, setActiveModules] = useState<string[] | null>(null);
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [sidebarOuvert, setSidebarOuvert] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const u = getUser();
    setUser(u);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    Promise.all([
      api.get('/groupes/mes-permissions').catch(() => ({ data: {} })),
      api.get('/tenant/mes-modules').catch(() => ({ data: [] })),
      fetch(`${apiUrl}/api/v1/tenants/${tenant}/branding`).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([permRes, modulesRes, brandingData]) => {
      setPermissions(permRes.data as PermissionsMap);
      setActiveModules(modulesRes.data as string[]);
      if (brandingData) {
        setBranding(brandingData as Branding);
        const root = document.documentElement;
        root.style.setProperty('--color-primary',  (brandingData as Branding).couleurPrimaire  ?? '#1e3a8a');
        root.style.setProperty('--color-secondary', (brandingData as Branding).couleurSecondaire ?? '#4CAF50');
      }
    });
  }, [router, tenant]);

  if (!user || permissions === null || activeModules === null) return null;

  return (
    <PermissionsContext.Provider value={permissions}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar tenantSlug={tenant} userRole={user.role} permissions={permissions} activeModules={activeModules} branding={branding} ouvert={sidebarOuvert} setOuvert={setSidebarOuvert} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} tenantSlug={tenant} onMenuClick={() => setSidebarOuvert(true)} />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </PermissionsContext.Provider>
  );
}
