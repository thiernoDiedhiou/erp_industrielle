'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ShoppingCart, Factory, Package, TrendingUp, AlertTriangle, Users } from 'lucide-react';

interface Kpis {
  commandesMois: number;
  commandesParStatut: Record<string, number>;
  chiffreAffairesMois: number;
  ofsActifs: number;
  alertesStock: number;
  clientsTotal: number;
  recyclageCollectesMois: number;
}

function KpiCard({
  titre,
  valeur,
  icone,
  couleur,
  sousTitre,
}: {
  titre: string;
  valeur: string | number;
  icone: React.ReactNode;
  couleur: string;
  sousTitre?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{titre}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{valeur}</p>
          {sousTitre && <p className="text-xs text-gray-400 mt-1">{sousTitre}</p>}
        </div>
        <div className={`p-3 rounded-lg ${couleur}`}>{icone}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { tenant } = useParams<{ tenant: string }>();

  const { data: kpis, isLoading } = useQuery<Kpis>({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/kpis');
      return data;
    },
  });

  const { data: activite } = useQuery({
    queryKey: ['dashboard-activite'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/activite-recente');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Tableau de bord</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <KpiCard
          titre="Commandes ce mois"
          valeur={kpis?.commandesMois ?? 0}
          icone={<ShoppingCart size={22} className="text-blue-600" />}
          couleur="bg-blue-50"
        />
        <KpiCard
          titre="CA ce mois"
          valeur={
            kpis
              ? kpis.chiffreAffairesMois >= 1000
                ? `${(kpis.chiffreAffairesMois / 1000).toFixed(0)}K FCFA`
                : `${kpis.chiffreAffairesMois.toLocaleString('fr-FR')} FCFA`
              : '— FCFA'
          }
          icone={<TrendingUp size={22} className="text-green-600" />}
          couleur="bg-green-50"
        />
        <KpiCard
          titre="OFs en production"
          valeur={kpis?.ofsActifs ?? 0}
          icone={<Factory size={22} className="text-orange-600" />}
          couleur="bg-orange-50"
        />
        <KpiCard
          titre="Alertes stock"
          valeur={kpis?.alertesStock ?? 0}
          icone={<AlertTriangle size={22} className="text-red-600" />}
          couleur="bg-red-50"
          sousTitre="matières sous seuil"
        />
        <KpiCard
          titre="Clients"
          valeur={kpis?.clientsTotal ?? 0}
          icone={<Users size={22} className="text-purple-600" />}
          couleur="bg-purple-50"
        />
        <KpiCard
          titre="Collectes recyclage"
          valeur={kpis?.recyclageCollectesMois ?? 0}
          icone={<Package size={22} className="text-teal-600" />}
          couleur="bg-teal-50"
          sousTitre="ce mois"
        />
      </div>

      {/* Statuts commandes */}
      {kpis?.commandesParStatut && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Répartition des commandes</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(kpis.commandesParStatut).map(([statut, count]) => (
              <span
                key={statut}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
              >
                {statut}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Activité récente */}
      {activite && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Dernières commandes</h2>
            <div className="space-y-2">
              {activite.commandes?.map((c: { id: string; reference: string; statut: string; client?: { nom: string }; updatedAt: string }) => (
                <div key={c.id} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                  <Link
                    href={`/${tenant}/commandes/${c.id}`}
                    className="font-medium text-blue-700 hover:underline shrink-0"
                  >
                    {c.reference}
                  </Link>
                  <span className="text-gray-500 text-xs truncate flex-1">{c.client?.nom}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                    {c.statut}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Ordres de fabrication</h2>
            <div className="space-y-2">
              {activite.ordresFabrication?.map((of: { id: string; reference: string; statut: string; produitFini: string }) => (
                <div key={of.id} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                  <Link
                    href={`/${tenant}/production`}
                    className="font-medium text-orange-700 hover:underline shrink-0"
                  >
                    {of.reference}
                  </Link>
                  <span className="text-gray-500 text-xs truncate flex-1">{of.produitFini}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 shrink-0">
                    {of.statut}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
