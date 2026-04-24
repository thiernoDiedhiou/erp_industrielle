'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
  Recycle, Download, ChevronDown,
} from 'lucide-react';

// ─── Charte graphique tenant ──────────────────────────────────────────────────

function useBrandColors() {
  const [colors, setColors] = useState({ primary: '#1565C0', secondary: '#4CAF50' });
  useEffect(() => {
    const s = getComputedStyle(document.documentElement);
    const p = s.getPropertyValue('--color-primary').trim();
    const sec = s.getPropertyValue('--color-secondary').trim();
    if (p) setColors({ primary: p, secondary: sec || '#4CAF50' });
  }, []);
  return colors;
}

// ─── Référentiels ─────────────────────────────────────────────────────────────

const STATUTS_COMMANDE: Record<string, { label: string; couleur: string }> = {
  brouillon:     { label: 'Brouillon',      couleur: '#94a3b8' },
  confirmee:     { label: 'Confirmée',      couleur: '#3b82f6' },
  en_production: { label: 'En production',  couleur: '#f59e0b' },
  livree:        { label: 'Livrée',         couleur: '#10b981' },
  facturee:      { label: 'Facturée',       couleur: '#8b5cf6' },
  annulee:       { label: 'Annulée',        couleur: '#ef4444' },
};

const TYPE_DECHET_LABEL: Record<string, string> = {
  plastique_pe: 'Plastique PE', plastique_pp: 'Plastique PP',
  plastique_pvc: 'Plastique PVC', plastique_pet: 'Plastique PET',
  chutes_film: 'Chutes Film', granules_recycles: 'Granulés recyclés',
  emballages_usages: 'Emballages usagés', carton: 'Carton',
  metal: 'Métal', caoutchouc: 'Caoutchouc', autre: 'Autre',
};

const COULEURS_RECYCLE = ['#0d9488', '#0891b2', '#7c3aed', '#db2777', '#ea580c', '#65a30d', '#ca8a04'];

// ─── Utilitaires ─────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-SN', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

const fmtFull = (v: number) => v.toLocaleString('fr-FR');

const ANNEES_DISPO = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

// CSV export
function exportCSV(filename: string, rows: string[][], headers: string[]) {
  const BOM = '﻿';
  const csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Composants réutilisables ─────────────────────────────────────────────────

function Section({ titre, children, action }: { titre: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">{titre}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function KpiMini({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Gauge({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 36; const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={r} fill="none" stroke="#f3f4f6" strokeWidth={8} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeDashoffset={circ / 4} strokeLinecap="round" />
        <text x={45} y={50} textAnchor="middle" fontSize={16} fontWeight={700} fill={color}>{pct}%</text>
      </svg>
      <p className="text-xs text-gray-500 text-center">{label}</p>
    </div>
  );
}

const TooltipCustom = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmtFull(Number(p.value))} {p.unit ?? ''}</p>
      ))}
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ReportingPage() {
  const { primary, secondary } = useBrandColors();
  const [annee, setAnnee] = useState(new Date().getFullYear());

  const qOpts = (key: string, url: string) => ({
    queryKey: [key, annee],
    queryFn: async () => (await api.get(url, { params: { annee } })).data,
  });

  const { data: caMensuel }       = useQuery(qOpts('r-ca',     '/dashboard/reporting/ca-mensuel'));
  const { data: stockCritique }   = useQuery({ queryKey: ['r-stock'], queryFn: async () => (await api.get('/dashboard/reporting/stock-critique')).data });
  const { data: topClients }      = useQuery({ queryKey: ['r-clients'], queryFn: async () => (await api.get('/dashboard/reporting/top-clients')).data });
  const { data: cmdStatut }       = useQuery({ queryKey: ['r-cmd-statut'], queryFn: async () => (await api.get('/dashboard/reporting/commandes-statut')).data });
  const { data: cmdAnalytique }   = useQuery(qOpts('r-cmd-an', '/dashboard/reporting/commandes-analytique'));
  const { data: prodAnalytique }  = useQuery(qOpts('r-prod-an','/dashboard/reporting/production-analytique'));
  const { data: recyAnalytique }  = useQuery(qOpts('r-recy-an','/dashboard/reporting/recyclage-analytique'));

  const exportCommandesCsv = useCallback(() => {
    const rows = (cmdAnalytique?.parMois ?? []).map((m: any) => [m.mois, m.commandes, m.montant]);
    exportCSV(`commandes_${annee}.csv`, rows, ['Mois', 'Nb commandes', 'Montant HT (FCFA)']);
  }, [cmdAnalytique, annee]);

  const exportRecyCsv = useCallback(() => {
    const rows = (recyAnalytique?.parType ?? []).map((t: any) => [
      TYPE_DECHET_LABEL[t.type] ?? t.type, t.count, t.quantite,
    ]);
    exportCSV(`recyclage_${annee}.csv`, rows, ['Type déchet', 'Nb collectes', 'Quantité (kg)']);
  }, [recyAnalytique, annee]);

  const exportStockCsv = useCallback(() => {
    const rows = (stockCritique ?? []).map((m: any) => [m.nom, m.stockActuel, m.stockMinimum, m.unite, m.critique ? 'OUI' : 'NON']);
    exportCSV(`stock_critique_${annee}.csv`, rows, ['Matière', 'Stock actuel', 'Stock minimum', 'Unité', 'Critique']);
  }, [stockCritique, annee]);

  // Statuts commandes avec labels lisibles
  const cmdStatutFormatted = (cmdStatut ?? []).map((s: any) => ({
    ...s,
    label: STATUTS_COMMANDE[s.statut]?.label ?? s.statut,
    fill: STATUTS_COMMANDE[s.statut]?.couleur ?? s.couleur,
  }));

  return (
    <div className="space-y-6">

      {/* ── En-tête + sélecteur année ────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Reporting & Analytique</h1>
          <p className="text-xs text-gray-500 mt-0.5">Indicateurs de performance opérationnelle</p>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Année</span>
          <div className="relative">
            <select
              value={annee}
              onChange={(e) => setAnnee(+e.target.value)}
              title="Sélectionner l'année"
              aria-label="Sélectionner l'année"
              className="appearance-none bg-transparent pr-6 text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              {ANNEES_DISPO.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── KPIs synthèse ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiMini
          label="CA encaissé"
          value={`${fmt(caMensuel?.reduce((s: number, m: any) => s + m.ca, 0) ?? 0)} FCFA`}
          sub={`${annee}`}
          color={primary}
        />
        <KpiMini
          label="Commandes"
          value={cmdAnalytique?.totalAnnee ?? 0}
          sub={`Taux livraison : ${cmdAnalytique?.tauxLivraison ?? 0}%`}
          color={primary}
        />
        <KpiMini
          label="OFs réalisés"
          value={prodAnalytique?.totalAnnee ?? 0}
          sub={`Taux completion : ${prodAnalytique?.tauxCompletion ?? 0}%`}
          color={secondary}
        />
        <KpiMini
          label="Tonnage recyclé"
          value={`${fmtFull(recyAnalytique?.totalQuantite ?? 0)} kg`}
          sub={`Valorisation : ${recyAnalytique?.tauxValorisation ?? 0}%`}
          color="#0d9488"
        />
      </div>

      {/* ── CA mensuel ─────────────────────────────────────────────────────── */}
      <Section titre={`Chiffre d'affaires mensuel — ${annee} (FCFA)`}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={caMensuel ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primary} stopOpacity={0.2} />
                <stop offset="95%" stopColor={primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<TooltipCustom />} />
            <Area type="monotone" dataKey="ca" name="CA (FCFA)" stroke={primary} strokeWidth={2}
              fill="url(#caGrad)" dot={false} activeDot={{ r: 5, fill: primary }} />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      {/* ── Commandes ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Volume mensuel */}
        <Section titre={`Volume commandes — ${annee}`}
          action={
            <button type="button" onClick={exportCommandesCsv}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 border rounded-lg px-2 py-1 hover:border-blue-300">
              <Download size={12} /> CSV
            </button>
          }>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cmdAnalytique?.parMois ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="commandes" name="Commandes" fill={primary} radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 pt-3 border-t">
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: primary }}>{cmdAnalytique?.totalAnnee ?? 0}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{cmdAnalytique?.tauxLivraison ?? 0}%</p>
              <p className="text-xs text-gray-400">Taux livraison</p>
            </div>
          </div>
        </Section>

        {/* Répartition par statut */}
        <Section titre="Répartition par statut">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={cmdStatutFormatted} dataKey="count" nameKey="label"
                cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                {cmdStatutFormatted.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, name: any) => [`${v} commande${v > 1 ? 's' : ''}`, name]} />
              <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        {/* Top 5 clients */}
        <Section titre="Top 5 clients — CA (FCFA)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topClients ?? []} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nom" tick={{ fontSize: 10, fill: '#374151' }} axisLine={false} tickLine={false} width={85} />
              <Tooltip formatter={(v: any) => [`${fmtFull(v)} FCFA`, 'CA']} />
              <Bar dataKey="ca" radius={[0, 4, 4, 0]}>
                {(topClients ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={primary} fillOpacity={1 - i * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ── Production ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* OFs par mois */}
        <Section titre={`OFs lancés par mois — ${annee}`}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={prodAnalytique?.parMois ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="ofs" name="OFs" fill={secondary} radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* Taux de complétion */}
        <Section titre="Taux de complétion des OFs">
          <div className="flex items-center justify-around py-4">
            <Gauge pct={prodAnalytique?.tauxCompletion ?? 0} color={secondary} label="Taux completion" />
            <div className="space-y-2 text-sm">
              {(prodAnalytique?.parStatut ?? []).map((s: any) => (
                <div key={s.statut} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.couleur }} />
                  <span className="text-gray-600 text-xs">{s.label}</span>
                  <span className="font-semibold text-xs text-gray-800 ml-auto">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Stock critique */}
        <Section titre="Niveaux stock — Matières premières"
          action={
            <button type="button" onClick={exportStockCsv}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 border rounded-lg px-2 py-1 hover:border-blue-300">
              <Download size={12} /> CSV
            </button>
          }>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stockCritique ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="nom" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<TooltipCustom />} />
              <Bar dataKey="stockActuel" name="Stock actuel" radius={[4, 4, 0, 0]}>
                {(stockCritique ?? []).map((e: any, i: number) => (
                  <Cell key={i} fill={e.critique ? '#ef4444' : primary} />
                ))}
              </Bar>
              <Bar dataKey="stockMinimum" name="Seuil minimum" fill="#fbbf24" opacity={0.5} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
            Barre rouge = sous le seuil minimum
          </p>
        </Section>
      </div>

      {/* ── Recyclage ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tonnage mensuel */}
        <Section titre={`Recyclage — Tonnage mensuel ${annee}`}
          action={
            <button type="button" onClick={exportRecyCsv}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 border rounded-lg px-2 py-1 hover:border-teal-300">
              <Download size={12} /> CSV
            </button>
          }>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={recyAnalytique?.parMois ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="recyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<TooltipCustom />} />
              <Area type="monotone" dataKey="quantite" name="Quantité (kg)" stroke="#0d9488"
                strokeWidth={2} fill="url(#recyGrad)" dot={false} activeDot={{ r: 4, fill: '#0d9488' }} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        {/* Répartition par type */}
        <Section titre="Répartition par type de déchet">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={(recyAnalytique?.parType ?? []).map((t: any) => ({
                ...t, label: TYPE_DECHET_LABEL[t.type] ?? t.type,
              }))}
                dataKey="quantite" nameKey="label"
                cx="50%" cy="50%" outerRadius={70} paddingAngle={2}>
                {(recyAnalytique?.parType ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={COULEURS_RECYCLE[i % COULEURS_RECYCLE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, name: any) => [`${fmtFull(Number(v))} kg`, name]} />
              <Legend formatter={(v) => <span style={{ fontSize: 10 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        {/* Taux valorisation */}
        <Section titre="Performance recyclage">
          <div className="flex flex-col items-center justify-center py-4 gap-4">
            <Gauge pct={recyAnalytique?.tauxValorisation ?? 0} color="#0d9488" label="Taux de valorisation" />
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-gray-600 border-b pb-2">
                <span>Total collectes</span>
                <span className="font-semibold">{recyAnalytique?.totalCollectes ?? 0}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 border-b pb-2">
                <span>Tonnage total</span>
                <span className="font-semibold">{fmtFull(recyAnalytique?.totalQuantite ?? 0)} kg</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1"><Recycle size={11} className="text-teal-600" /> Types collectés</span>
                <span className="font-semibold">{recyAnalytique?.parType?.length ?? 0}</span>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
