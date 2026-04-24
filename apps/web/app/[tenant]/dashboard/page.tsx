'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  ShoppingCart, Factory, AlertTriangle, Users,
  TrendingUp, TrendingDown, FileWarning, ArrowRight,
} from 'lucide-react';

// ─── Charte graphique du tenant ──────────────────────────────────────────────

function useBrandColors() {
  const [colors, setColors] = useState({ primary: '#1565C0', secondary: '#4CAF50' });
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const p = style.getPropertyValue('--color-primary').trim();
    const s = style.getPropertyValue('--color-secondary').trim();
    if (p) setColors({ primary: p, secondary: s || '#4CAF50' });
  }, []);
  return colors;
}

// ─── Labels statuts ───────────────────────────────────────────────────────────

const STATUTS_COMMANDE: Record<string, { label: string; color: string }> = {
  brouillon:     { label: 'Brouillon',      color: '#94a3b8' },
  confirmee:     { label: 'Confirmée',      color: '#3b82f6' },
  en_production: { label: 'En production',  color: '#f59e0b' },
  livree:        { label: 'Livrée',         color: '#10b981' },
  facturee:      { label: 'Facturée',       color: '#8b5cf6' },
  annulee:       { label: 'Annulée',        color: '#ef4444' },
};

const STATUTS_OF: Record<string, string> = {
  brouillon: 'Brouillon',
  planifie:  'Planifié',
  en_cours:  'En cours',
  termine:   'Terminé',
  annule:    'Annulé',
};

const formatCA = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
      ? `${(v / 1_000).toFixed(0)}K`
      : String(v);

// ─── Composants ──────────────────────────────────────────────────────────────

function KpiCard({
  titre, valeur, sousTitre, icone, couleurBg, couleurTexte, tendance, lien, tenant,
}: {
  titre: string;
  valeur: string | number;
  sousTitre?: string;
  icone: React.ReactNode;
  couleurBg: string;
  couleurTexte: string;
  tendance?: number | null;
  lien?: string;
  tenant?: string;
}) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{titre}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1 truncate">{valeur}</p>
          {sousTitre && <p className="text-xs text-gray-400 mt-1">{sousTitre}</p>}
          {tendance !== undefined && tendance !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${tendance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {tendance >= 0
                ? <TrendingUp size={12} />
                : <TrendingDown size={12} />}
              {tendance >= 0 ? '+' : ''}{tendance}% vs mois précédent
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl flex-shrink-0 ${couleurBg}`}>
          <div className={couleurTexte}>{icone}</div>
        </div>
      </div>
    </div>
  );

  if (lien && tenant) {
    return <Link href={`/${tenant}${lien}`}>{content}</Link>;
  }
  return content;
}

// Tooltip recharts personnalisé
const TooltipCA = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-gray-800">{Number(payload[0].value).toLocaleString('fr-FR')} FCFA</p>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { tenant } = useParams<{ tenant: string }>();
  const { primary, secondary } = useBrandColors();

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => (await api.get('/dashboard/kpis')).data,
  });

  const { data: activite } = useQuery({
    queryKey: ['dashboard-activite'],
    queryFn: async () => (await api.get('/dashboard/activite-recente')).data,
  });

  const { data: caMensuel } = useQuery({
    queryKey: ['dashboard-ca-mensuel'],
    queryFn: async () => (await api.get('/dashboard/reporting/ca-mensuel')).data,
  });

  const { data: topClients } = useQuery({
    queryKey: ['dashboard-top-clients'],
    queryFn: async () => (await api.get('/dashboard/reporting/top-clients')).data,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primary }} />
      </div>
    );
  }

  const commandesParStatut = Object.entries(kpis?.commandesParStatut ?? {}).map(
    ([statut, count]) => ({
      statut,
      label: STATUTS_COMMANDE[statut]?.label ?? statut,
      count: count as number,
      color: STATUTS_COMMANDE[statut]?.color ?? '#6b7280',
    }),
  );

  const totalCommandes = commandesParStatut.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('fr-SN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── KPIs principaux ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titre="CA ce mois"
          valeur={`${formatCA(kpis?.chiffreAffairesMois ?? 0)} FCFA`}
          sousTitre="factures encaissées"
          icone={<TrendingUp size={22} />}
          couleurBg="bg-green-50"
          couleurTexte="text-green-600"
          tendance={kpis?.tendanceCa}
        />
        <KpiCard
          titre="Commandes"
          valeur={kpis?.commandesMois ?? 0}
          sousTitre="créées ce mois"
          icone={<ShoppingCart size={22} />}
          couleurBg="bg-blue-50"
          couleurTexte="text-blue-600"
          lien="/commandes"
          tenant={tenant}
        />
        <KpiCard
          titre="OFs en cours"
          valeur={kpis?.ofsActifs ?? 0}
          sousTitre="ordres de fabrication actifs"
          icone={<Factory size={22} />}
          couleurBg="bg-orange-50"
          couleurTexte="text-orange-600"
          lien="/production"
          tenant={tenant}
        />
        <KpiCard
          titre="Clients"
          valeur={kpis?.clientsTotal ?? 0}
          sousTitre="dans le portefeuille"
          icone={<Users size={22} />}
          couleurBg="bg-purple-50"
          couleurTexte="text-purple-600"
          lien="/crm"
          tenant={tenant}
        />
      </div>

      {/* ── Alertes ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alertes stock */}
        <div className={`rounded-xl border p-5 ${(kpis?.alertesStock ?? 0) > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className={(kpis?.alertesStock ?? 0) > 0 ? 'text-red-500' : 'text-gray-400'} />
              <h3 className="font-semibold text-gray-700 text-sm">Alertes stock</h3>
            </div>
            <span className={`text-2xl font-bold ${(kpis?.alertesStock ?? 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {kpis?.alertesStock ?? 0}
            </span>
          </div>
          {(kpis?.mpCritiques ?? []).length > 0 ? (
            <div className="space-y-2">
              {kpis.mpCritiques.slice(0, 4).map((mp: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                      <span className="truncate font-medium">{mp.nom}</span>
                      <span className={mp.critique ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        {mp.stockActuel} / {mp.stockMinimum} {mp.unite}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${mp.critique ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, mp.stockMinimum > 0 ? (mp.stockActuel / mp.stockMinimum) * 100 : 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Link href={`/${tenant}/matieres-premieres`}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                Voir toutes les matières <ArrowRight size={11} />
              </Link>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Tous les stocks sont au-dessus du seuil minimum.</p>
          )}
        </div>

        {/* Factures impayées */}
        <div className={`rounded-xl border p-5 ${(kpis?.facturesImpayeesCount ?? 0) > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileWarning size={18} className={(kpis?.facturesImpayeesCount ?? 0) > 0 ? 'text-amber-500' : 'text-gray-400'} />
              <h3 className="font-semibold text-gray-700 text-sm">Factures impayées</h3>
            </div>
            <span className={`text-2xl font-bold ${(kpis?.facturesImpayeesCount ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
              {kpis?.facturesImpayeesCount ?? 0}
            </span>
          </div>
          {(kpis?.facturesImpayeesCount ?? 0) > 0 ? (
            <>
              <p className="text-sm text-gray-700 font-semibold">
                {Number(kpis.facturesImpayeesTotal).toLocaleString('fr-FR')} FCFA
              </p>
              <p className="text-xs text-gray-500 mt-0.5">en attente de règlement</p>
              <Link href={`/${tenant}/facturation`}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-3">
                Voir les factures <ArrowRight size={11} />
              </Link>
            </>
          ) : (
            <p className="text-xs text-gray-400">Aucune facture en attente de règlement.</p>
          )}
        </div>
      </div>

      {/* ── Graphiques ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* CA mensuel — Area chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Chiffre d'affaires — 12 derniers mois</h2>
            <span className="text-xs text-gray-400">FCFA (factures payées)</span>
          </div>
          {caMensuel?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={caMensuel} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primary} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatCA(v)} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={45} />
                <Tooltip content={<TooltipCA />} />
                <Area
                  type="monotone"
                  dataKey="ca"
                  stroke={primary}
                  strokeWidth={2}
                  fill="url(#caGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: primary }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">Aucune donnée disponible</div>
          )}
        </div>

        {/* Répartition commandes */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Répartition des commandes</h2>
          {commandesParStatut.length > 0 ? (
            <div className="space-y-2.5">
              {commandesParStatut.map((s) => (
                <div key={s.statut}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{s.label}</span>
                    <span className="font-semibold">{s.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: totalCommandes > 0 ? `${(s.count / totalCommandes) * 100}%` : '0%',
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">{totalCommandes} commande{totalCommandes > 1 ? 's' : ''} au total</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">Aucune commande</p>
          )}
        </div>
      </div>

      {/* ── Top clients + Activité ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top 5 clients */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Top 5 clients — CA</h2>
          {topClients?.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={topClients} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" tickFormatter={(v) => formatCA(v)} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nom" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} FCFA`, 'CA']} />
                <Bar dataKey="ca" radius={[0, 4, 4, 0]}>
                  {topClients.map((_: any, i: number) => (
                    <Cell key={i} fill={i === 0 ? primary : secondary} fillOpacity={1 - i * 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">Aucune donnée</p>
          )}
        </div>

        {/* Activité récente */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Dernières commandes */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700 text-sm">Dernières commandes</h2>
              <Link href={`/${tenant}/commandes`} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                Tout voir <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-2">
              {activite?.commandes?.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Aucune commande</p>
              )}
              {activite?.commandes?.map((c: any) => {
                const s = STATUTS_COMMANDE[c.statut];
                return (
                  <div key={c.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                    <Link href={`/${tenant}/commandes/${c.id}`}
                      className="font-semibold text-xs shrink-0 hover:underline"
                      style={{ color: primary }}>
                      {c.reference}
                    </Link>
                    <span className="text-xs text-gray-500 truncate flex-1">{c.client?.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                      style={{ backgroundColor: `${s?.color}20`, color: s?.color }}>
                      {s?.label ?? c.statut}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordres de fabrication */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700 text-sm">Ordres de fabrication</h2>
              <Link href={`/${tenant}/production`} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                Tout voir <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-2">
              {activite?.ordresFabrication?.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Aucun OF en cours</p>
              )}
              {activite?.ordresFabrication?.map((of: any) => (
                <div key={of.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                  <Link href={`/${tenant}/production`}
                    className="font-semibold text-xs shrink-0 hover:underline"
                    style={{ color: secondary || '#f59e0b' }}>
                    {of.reference}
                  </Link>
                  <span className="text-xs text-gray-500 truncate flex-1">{of.produitFini}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 shrink-0 font-medium">
                    {STATUTS_OF[of.statut] ?? of.statut}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
