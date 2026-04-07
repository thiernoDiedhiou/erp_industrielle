'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-SN', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

export default function ReportingPage() {
  const { data: caMensuel } = useQuery({
    queryKey: ['reporting-ca'],
    queryFn: async () => (await api.get('/dashboard/reporting/ca-mensuel')).data,
  });
  const { data: stockCritique } = useQuery({
    queryKey: ['reporting-stock'],
    queryFn: async () => (await api.get('/dashboard/reporting/stock-critique')).data,
  });
  const { data: commandesStatut } = useQuery({
    queryKey: ['reporting-commandes'],
    queryFn: async () => (await api.get('/dashboard/reporting/commandes-statut')).data,
  });
  const { data: topClients } = useQuery({
    queryKey: ['reporting-clients'],
    queryFn: async () => (await api.get('/dashboard/reporting/top-clients')).data,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Reporting & Analytique</h1>

      {/* CA Mensuel */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Chiffre d'affaires mensuel — 12 mois glissants (FCFA)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={caMensuel ?? []}>
            <defs>
              <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1565C0" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={55} />
            <Tooltip
              formatter={(v) => [fmt(Number(v)) + ' FCFA', 'CA']}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="ca"
              stroke="#1565C0"
              strokeWidth={2}
              fill="url(#caGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Répartition commandes par statut */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Répartition commandes par statut
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={commandesStatut ?? []}
                dataKey="count"
                nameKey="statut"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {(commandesStatut ?? []).map((entry: { statut: string; couleur: string }, i: number) => (
                  <Cell key={i} fill={entry.couleur} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [String(v) + ' cmd', String(name)]} />
              <Legend
                formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top clients */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Top 5 clients par CA (FCFA)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topClients ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="nom" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v) => [fmt(Number(v)) + ' FCFA', 'CA']} />
              <Bar dataKey="ca" fill="#4CAF50" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock critique */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Niveaux de stock des matières premières
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stockCritique ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="nom" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v, name) => [Number(v), String(name) === 'stockActuel' ? 'Stock actuel' : 'Stock minimum']}
            />
            <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v === 'stockActuel' ? 'Stock actuel' : 'Stock minimum'}</span>} />
            <Bar dataKey="stockActuel" name="stockActuel" radius={[4, 4, 0, 0]}>
              {(stockCritique ?? []).map((entry: { critique: boolean }, i: number) => (
                <Cell key={i} fill={entry.critique ? '#ef4444' : '#3b82f6'} />
              ))}
            </Bar>
            <Bar dataKey="stockMinimum" name="stockMinimum" fill="#fbbf24" opacity={0.6} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
          Barres rouges = sous le seuil minimum
        </p>
      </div>
    </div>
  );
}
