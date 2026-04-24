'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Users, ShoppingCart, FileText, Factory, UserCheck,
  Package, Puzzle, Building2, MapPin, Phone, TrendingUp,
} from 'lucide-react';

interface StatsTenant {
  nbUsers: number;
  nbCommandes: number;
  nbFactures: number;
  nbClients: number;
  nbOF: number;
  totalCA: number;
  modulesActifs: { code: string; nom: string }[];
  tenant: {
    nom: string;
    plan: string;
    ville?: string;
    secteur?: string;
    pays?: string;
    telephone?: string;
  } | null;
}

const MODULE_COLORS: Record<string, string> = {
  crm:                'bg-blue-50 text-blue-700 border-blue-200',
  commandes:          'bg-orange-50 text-orange-700 border-orange-200',
  production:         'bg-purple-50 text-purple-700 border-purple-200',
  stock:              'bg-green-50 text-green-700 border-green-200',
  facturation:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  recyclage:          'bg-teal-50 text-teal-700 border-teal-200',
  reporting:          'bg-indigo-50 text-indigo-700 border-indigo-200',
  fournisseurs:       'bg-yellow-50 text-yellow-700 border-yellow-200',
  machines:           'bg-red-50 text-red-700 border-red-200',
  'matieres-premieres': 'bg-lime-50 text-lime-700 border-lime-200',
  logistique:         'bg-sky-50 text-sky-700 border-sky-200',
  bom:                'bg-violet-50 text-violet-700 border-violet-200',
};

const MODULE_ROUTES: Record<string, string> = {
  crm:                'crm',
  commandes:          'commandes',
  production:         'production',
  stock:              'stock',
  facturation:        'facturation',
  recyclage:          'recyclage',
  reporting:          'reporting',
  fournisseurs:       'fournisseurs',
  machines:           'machines',
  'matieres-premieres': 'matieres-premieres',
  logistique:         'logistique',
  bom:                'bom',
};

const PLAN_BADGE: Record<string, string> = {
  starter:    'bg-gray-100 text-gray-600',
  pro:        'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

export default function AdminPage() {
  const params = useParams();
  const router = useRouter();

  const { data: stats, isLoading } = useQuery<StatsTenant>({
    queryKey: ['admin-stats-tenant'],
    queryFn: async () => (await api.get('/admin/stats-tenant')).data,
  });

  const fmt = (v: number) =>
    new Intl.NumberFormat('fr-SN', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

  const kpis = stats
    ? [
        { label: 'Utilisateurs actifs',  val: stats.nbUsers,      icon: <Users size={18} className="text-purple-600" />,  bg: 'bg-purple-50' },
        { label: 'Clients',              val: stats.nbClients,     icon: <UserCheck size={18} className="text-blue-600" />, bg: 'bg-blue-50' },
        { label: 'Commandes',            val: stats.nbCommandes,   icon: <ShoppingCart size={18} className="text-orange-600" />, bg: 'bg-orange-50' },
        { label: 'Ordres de fabrication',val: stats.nbOF,          icon: <Factory size={18} className="text-purple-600" />,bg: 'bg-purple-50' },
        { label: 'Factures',             val: stats.nbFactures,    icon: <FileText size={18} className="text-green-600" />, bg: 'bg-green-50' },
        { label: 'CA encaissé (FCFA)',   val: fmt(stats.totalCA),  icon: <TrendingUp size={18} className="text-emerald-600" />, bg: 'bg-emerald-50' },
      ]
    : [];

  return (
    <div className="space-y-6">

      {/* ── En-tête tenant ── */}
      {stats?.tenant && (
        <div className="bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            {stats.tenant.nom.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">{stats.tenant.nom}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_BADGE[stats.tenant.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                {stats.tenant.plan}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
              {stats.tenant.secteur && (
                <span className="flex items-center gap-1">
                  <Building2 size={13} /> {stats.tenant.secteur}
                </span>
              )}
              {stats.tenant.ville && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {stats.tenant.ville}{stats.tenant.pays ? `, ${stats.tenant.pays}` : ''}
                </span>
              )}
              {stats.tenant.telephone && (
                <span className="flex items-center gap-1">
                  <Phone size={13} /> {stats.tenant.telephone}
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-gray-400 flex-shrink-0">
            <p className="font-medium text-gray-600">{stats.modulesActifs.length} modules actifs</p>
          </div>
        </div>
      )}

      {/* ── KPIs tenant ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border shadow-sm p-4 h-20 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${k.bg}`}>{k.icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{k.label}</p>
                <p className="font-bold text-gray-800 text-lg leading-tight">{k.val}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modules actifs + accès rapide ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Modules activés */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
            <Puzzle size={15} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">Modules activés</h2>
            <span className="ml-auto text-xs text-gray-400">{stats?.modulesActifs.length ?? '—'} / 12</span>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {(stats?.modulesActifs ?? []).map((m) => (
              <span
                key={m.code}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${MODULE_COLORS[m.code] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
              >
                {m.nom}
              </span>
            ))}
            {!isLoading && stats?.modulesActifs.length === 0 && (
              <p className="text-sm text-gray-400">Aucun module actif</p>
            )}
          </div>
          <p className="px-5 pb-4 text-xs text-gray-400">
            Les modules sont gérés par l'administrateur plateforme Innosoft.
          </p>
        </div>

        {/* Accès rapide aux modules */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
            <Package size={15} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">Accès rapide</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {(stats?.modulesActifs ?? []).map((m) => {
              const route = MODULE_ROUTES[m.code];
              if (!route) return null;
              return (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => router.push(`/${params.tenant}/${route}`)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-opacity hover:opacity-80 ${MODULE_COLORS[m.code] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
                >
                  <Puzzle size={12} />
                  {m.nom}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Liens gestion interne ── */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Gestion interne</h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Utilisateurs',    route: 'settings/utilisateurs',  icon: <Users size={16} />,     color: 'text-purple-600 bg-purple-50' },
            { label: 'Groupes & Droits',route: 'settings/groupes',       icon: <UserCheck size={16} />, color: 'text-blue-600 bg-blue-50' },
            { label: 'Paramètres',      route: 'parametres',             icon: <Building2 size={16} />, color: 'text-gray-600 bg-gray-100' },
          ].map((link) => (
            <button
              key={link.route}
              type="button"
              onClick={() => router.push(`/${params.tenant}/${link.route}`)}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <div className={`p-2 rounded-lg ${link.color}`}>{link.icon}</div>
              {link.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
