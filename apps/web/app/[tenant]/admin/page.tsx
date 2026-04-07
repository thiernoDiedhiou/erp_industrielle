'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Building2, Users, ShoppingCart, FileText, ToggleLeft, ToggleRight, Puzzle } from 'lucide-react';

interface Tenant {
  id: string;
  slug: string;
  nom: string;
  secteur: string;
  plan: string;
  actif: boolean;
  ville?: string;
  nbUtilisateurs: number;
  modules: string[];
  createdAt: string;
}

interface StatsPlateforme {
  nbTenants: number;
  nbTenantActifs: number;
  nbUsers: number;
  nbCommandes: number;
  nbFactures: number;
  totalCA: number;
  modulesUsage: { code: string; nom: string; nbTenants: number }[];
}

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  pro: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

export default function AdminPage() {
  const qc = useQueryClient();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const { data: stats } = useQuery<StatsPlateforme>({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  const { data: tenants } = useQuery<Tenant[]>({
    queryKey: ['admin-tenants'],
    queryFn: async () => (await api.get('/admin/tenants')).data,
  });

  const { data: modules } = useQuery<{ code: string; nom: string; description: string }[]>({
    queryKey: ['admin-modules'],
    queryFn: async () => (await api.get('/admin/modules')).data,
  });

  const toggleTenant = useMutation({
    mutationFn: (vars: { id: string; actif: boolean }) =>
      api.patch(`/admin/tenants/${vars.id}/toggle`, { actif: vars.actif }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });

  const toggleModule = useMutation({
    mutationFn: (vars: { tenantId: string; code: string; actif: boolean }) =>
      api.patch(`/admin/tenants/${vars.tenantId}/modules/${vars.code}`, { actif: vars.actif }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] }),
  });

  const fmt = (v: number) =>
    new Intl.NumberFormat('fr-SN', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Administration Plateforme</h1>

      {/* KPIs globaux */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Tenants actifs', val: `${stats.nbTenantActifs}/${stats.nbTenants}`, icon: <Building2 size={18} className="text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'Utilisateurs', val: stats.nbUsers, icon: <Users size={18} className="text-purple-600" />, bg: 'bg-purple-50' },
            { label: 'Commandes', val: stats.nbCommandes, icon: <ShoppingCart size={18} className="text-orange-600" />, bg: 'bg-orange-50' },
            { label: 'Factures', val: stats.nbFactures, icon: <FileText size={18} className="text-green-600" />, bg: 'bg-green-50' },
            { label: 'CA total (FCFA)', val: fmt(stats.totalCA), icon: <FileText size={18} className="text-emerald-600" />, bg: 'bg-emerald-50' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${k.bg}`}>{k.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{k.label}</p>
                <p className="font-bold text-gray-800">{k.val}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Liste tenants */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Tenants</h2>
          </div>
          <div className="divide-y">
            {(tenants ?? []).map((t) => (
              <div
                key={t.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${selectedTenant?.id === t.id ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedTenant(t)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {t.nom.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.nom}</p>
                    <p className="text-xs text-gray-400">{t.slug} · {t.ville ?? ''} · {t.nbUtilisateurs} user(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[t.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                    {t.plan}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTenant.mutate({ id: t.id, actif: !t.actif }); }}
                    className="ml-1"
                    title={t.actif ? 'Désactiver' : 'Activer'}
                  >
                    {t.actif
                      ? <ToggleRight size={22} className="text-green-500" />
                      : <ToggleLeft size={22} className="text-gray-300" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel modules du tenant sélectionné */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">
              {selectedTenant ? `Modules — ${selectedTenant.nom}` : 'Sélectionner un tenant'}
            </h2>
          </div>
          {selectedTenant && (
            <div className="divide-y">
              {(modules ?? []).map((m) => {
                const actif = selectedTenant.modules.includes(m.code);
                return (
                  <div key={m.code} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Puzzle size={14} className={actif ? 'text-blue-600' : 'text-gray-300'} />
                      <div>
                        <p className="text-xs font-medium text-gray-700">{m.nom}</p>
                        <p className="text-[10px] text-gray-400">{m.code}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        toggleModule.mutate({ tenantId: selectedTenant.id, code: m.code, actif: !actif });
                        setSelectedTenant({ ...selectedTenant, modules: actif ? selectedTenant.modules.filter((c) => c !== m.code) : [...selectedTenant.modules, m.code] });
                      }}
                    >
                      {actif
                        ? <ToggleRight size={20} className="text-green-500" />
                        : <ToggleLeft size={20} className="text-gray-300" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {!selectedTenant && (
            <p className="text-center text-sm text-gray-400 py-8">
              Cliquez sur un tenant pour gérer ses modules
            </p>
          )}
        </div>
      </div>

      {/* Usage des modules */}
      {stats?.modulesUsage && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Adoption des modules</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {stats.modulesUsage.map((m) => (
              <div key={m.code} className="text-center">
                <div className="text-2xl font-bold text-blue-700">{m.nbTenants}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.nom}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
