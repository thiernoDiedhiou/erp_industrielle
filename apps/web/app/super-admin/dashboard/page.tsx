'use client';

import { useQuery } from '@tanstack/react-query';
import { saApi } from '@/lib/super-admin-api';
import { Building2, Users, ShoppingCart, FileText, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Stats {
  totalTenants: number;
  tenantsActifs: number;
  tenantsSuspendus: number;
  totalUsers: number;
  usersActifs: number;
  commandes: number;
  factures: number;
  parPlan: Record<string, number>;
}

const PLAN_STYLES: Record<string, string> = {
  starter:    'bg-gray-100 text-gray-700',
  pro:        'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['sa-stats'],
    queryFn: async () => (await saApi.get('/super-admin/tenants/stats')).data,
  });

  const { data: tenants } = useQuery({
    queryKey: ['sa-tenants-recent'],
    queryFn: async () => (await saApi.get('/super-admin/tenants')).data,
  });

  const kpis = stats ? [
    { label: 'Tenants actifs',    value: stats.tenantsActifs,    total: stats.totalTenants,  icon: <Building2 size={20} />, color: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'Utilisateurs actifs', value: stats.usersActifs,   total: stats.totalUsers,    icon: <Users size={20} />,     color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Commandes total',   value: stats.commandes,        total: null,                icon: <ShoppingCart size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Factures émises',   value: stats.factures,         total: null,                icon: <FileText size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord plateforme</h1>
        <p className="text-gray-500 text-sm mt-1">Vue globale de tous les tenants Innosoft ERP</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white rounded-2xl border shadow-sm p-5">
                <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.color} flex items-center justify-center mb-3`}>
                  {k.icon}
                </div>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value.toLocaleString('fr-FR')}</p>
                {k.total != null && (
                  <p className="text-xs text-gray-400 mt-0.5">sur {k.total} total</p>
                )}
                <p className="text-sm text-gray-500 mt-1">{k.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition par plan */}
            {stats && (
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-blue-600" />
                  <h2 className="font-semibold text-gray-800">Répartition par plan</h2>
                </div>
                <div className="space-y-3">
                  {Object.entries(stats.parPlan).map(([plan, nb]) => (
                    <div key={plan} className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${PLAN_STYLES[plan] ?? 'bg-gray-100 text-gray-600'}`}>
                        {plan}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${stats.totalTenants > 0 ? (nb / stats.totalTenants) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-6 text-right">{nb}</span>
                    </div>
                  ))}
                  {Object.keys(stats.parPlan).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Aucun tenant</p>
                  )}
                </div>
              </div>
            )}

            {/* Tenants suspendus */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={18} className="text-orange-500" />
                <h2 className="font-semibold text-gray-800">État des tenants</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-medium">Actifs</span>
                  </div>
                  <span className="font-bold text-green-700">{stats?.tenantsActifs ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium">Suspendus</span>
                  </div>
                  <span className="font-bold text-red-600">{stats?.tenantsSuspendus ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Liste rapide des tenants récents */}
          {tenants && tenants.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-700">Derniers tenants</h2>
                </div>
                <a href="/super-admin/tenants" className="text-xs text-blue-600 hover:underline">Voir tous →</a>
              </div>
              <div className="divide-y">
                {tenants.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {t.nom.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{t.nom}</p>
                      <p className="text-xs text-gray-400">{t.slug} · {t.secteur}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_STYLES[t.plan] ?? 'bg-gray-100'}`}>
                        {t.plan}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.actif ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {t.actif ? 'Actif' : 'Suspendu'}
                      </span>
                      <span className="text-xs text-gray-400">{t.nbUsers} user(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
