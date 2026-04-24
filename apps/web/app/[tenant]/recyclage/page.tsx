'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
  Recycle, Plus, X, Trash2, Search, ChevronRight,
  PackageCheck, FlaskConical, Leaf,
} from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

// ─── Référentiels ────────────────────────────────────────────────────────────

const TYPES_DECHETS: { value: string; label: string }[] = [
  { value: 'plastique_pe',      label: 'Plastique PE' },
  { value: 'plastique_pp',      label: 'Plastique PP' },
  { value: 'plastique_pvc',     label: 'Plastique PVC' },
  { value: 'plastique_pet',     label: 'Plastique PET' },
  { value: 'chutes_film',       label: 'Chutes Film' },
  { value: 'granules_recycles', label: 'Granulés recyclés' },
  { value: 'emballages_usages', label: 'Emballages usagés' },
  { value: 'carton',            label: 'Carton' },
  { value: 'metal',             label: 'Métal' },
  { value: 'caoutchouc',        label: 'Caoutchouc' },
  { value: 'autre',             label: 'Autre' },
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  TYPES_DECHETS.map((t) => [t.value, t.label]),
);

const formatType = (raw: string) =>
  TYPE_LABEL[raw] ??
  raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const STATUTS: {
  value: string;
  label: string;
  badge: string;
  next?: { value: string; label: string; icon: React.ReactNode };
}[] = [
  {
    value: 'collecte',
    label: 'Collecté',
    badge: 'bg-teal-50 text-teal-700 border border-teal-200',
    next: { value: 'en_traitement', label: 'Démarrer traitement', icon: <FlaskConical size={13} /> },
  },
  {
    value: 'en_traitement',
    label: 'En traitement',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    next: { value: 'traite', label: 'Marquer traité', icon: <PackageCheck size={13} /> },
  },
  {
    value: 'traite',
    label: 'Traité',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200',
    next: { value: 'valorise', label: 'Valoriser → Stock', icon: <Leaf size={13} /> },
  },
  {
    value: 'valorise',
    label: 'Valorisé',
    badge: 'bg-green-50 text-green-700 border border-green-200',
  },
];

const STATUT_MAP = Object.fromEntries(STATUTS.map((s) => [s.value, s]));

const STATUT_KPI_COLORS: Record<string, string> = {
  collecte:      'text-teal-700',
  en_traitement: 'text-blue-700',
  traite:        'text-purple-700',
  valorise:      'text-green-700',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Collecte {
  id: string;
  typeDechet: string;
  quantite: number;
  unite?: string;
  collecteur?: string;
  sourceAdresse?: string;
  notes?: string;
  statut: string;
  dateCollecte: string;
}

const FORM_VIDE = {
  typeDechet: '',
  quantite: '',
  unite: 'kg',
  collecteur: '',
  sourceAdresse: '',
  notes: '',
};

// ─── Composant ───────────────────────────────────────────────────────────────

export default function RecyclagePage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { peutEcrire, peutSupprimer } = usePermissions('recyclage');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Collecte | null>(null);

  // ─ Queries ─────────────────────────────────────────────────────────────────

  const { data: stats } = useQuery({
    queryKey: ['recyclage-stats'],
    queryFn: async () => (await api.get('/recyclage/stats')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['collectes'],
    queryFn: async () => (await api.get('/recyclage/collectes', { params: { limite: 100 } })).data,
  });

  // ─ Mutations ───────────────────────────────────────────────────────────────

  const creerMutation = useMutation({
    mutationFn: (d: object) => api.post('/recyclage/collectes', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collectes'] });
      qc.invalidateQueries({ queryKey: ['recyclage-stats'] });
      setShowForm(false);
      setForm(FORM_VIDE);
      toast.success('Collecte enregistrée');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de l\'enregistrement'),
  });

  const changerStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      api.put(`/recyclage/collectes/${id}/statut`, { statut }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['collectes'] });
      qc.invalidateQueries({ queryKey: ['recyclage-stats'] });
      const label = STATUT_MAP[vars.statut]?.label ?? vars.statut;
      toast.success(`Statut mis à jour : ${label}`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur changement de statut'),
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/recyclage/collectes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collectes'] });
      qc.invalidateQueries({ queryKey: ['recyclage-stats'] });
      setConfirmDelete(null);
      toast.success('Collecte supprimée');
    },
    onError: () => toast.error('Impossible de supprimer cette collecte'),
  });

  // ─ Données filtrées ─────────────────────────────────────────────────────────

  const items: Collecte[] = (data?.items ?? []).filter((c: Collecte) => {
    const matchSearch =
      !search ||
      formatType(c.typeDechet).toLowerCase().includes(search.toLowerCase()) ||
      (c.collecteur ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filtreStatut || c.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  // ─ Rendu ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Recyclage</h1>
          <p className="text-xs text-gray-500 mt-0.5">Collecte et valorisation des déchets industriels</p>
        </div>
        {peutEcrire && (
          <button
            type="button"
            onClick={() => { setForm(FORM_VIDE); setShowForm(true); }}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700"
          >
            <Plus size={16} /> Nouvelle collecte
          </button>
        )}
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border shadow-sm p-4 col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500">Total collectes</p>
            <p className="text-2xl font-bold text-teal-700 mt-0.5">{stats.totalCollectes}</p>
            <p className="text-xs text-gray-400 mt-1">{Number(stats.totalQuantite).toLocaleString('fr-FR')} kg total</p>
          </div>
          {STATUTS.map((s) => {
            const count = (stats.parStatut ?? []).find((p: any) => p.statut === s.value)?._count?.id ?? 0;
            return (
              <div key={s.value} className="bg-white rounded-xl border shadow-sm p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${STATUT_KPI_COLORS[s.value]}`}>{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par type, collecteur…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          title="Filtrer par statut"
          aria-label="Filtrer par statut"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type de déchet</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantité</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Collecteur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                      <Recycle size={28} className="mx-auto mb-2 text-gray-300" />
                      Aucune collecte trouvée
                    </td>
                  </tr>
                )}
                {items.map((c) => {
                  const statutInfo = STATUT_MAP[c.statut];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">

                      {/* Type */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <Recycle size={13} className="text-teal-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{formatType(c.typeDechet)}</span>
                        </div>
                      </td>

                      {/* Quantité */}
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        {Number(c.quantite).toLocaleString('fr-FR')} {c.unite || 'kg'}
                      </td>

                      {/* Collecteur */}
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {c.collecteur || <span className="text-gray-300">—</span>}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statutInfo?.badge ?? 'bg-gray-100 text-gray-600'}`}>
                          {statutInfo?.label ?? c.statut}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(c.dateCollecte).toLocaleDateString('fr-SN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Bouton workflow : passer au statut suivant */}
                          {peutEcrire && statutInfo?.next && (
                            <button
                              type="button"
                              title={statutInfo.next.label}
                              aria-label={statutInfo.next.label}
                              onClick={() => changerStatutMutation.mutate({ id: c.id, statut: statutInfo.next!.value })}
                              disabled={changerStatutMutation.isPending}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 disabled:opacity-50 transition-colors"
                            >
                              {statutInfo.next.icon}
                              <span className="hidden sm:inline">{statutInfo.next.label}</span>
                              <ChevronRight size={11} className="sm:hidden" />
                            </button>
                          )}

                          {/* Supprimer */}
                          {peutSupprimer && (
                            <button
                              type="button"
                              aria-label="Supprimer cette collecte"
                              onClick={() => setConfirmDelete(c)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pied de tableau */}
          {items.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-400">
              {items.length} collecte{items.length > 1 ? 's' : ''}
              {filtreStatut || search ? ' (filtrée)' : ' au total'}
            </div>
          )}
        </div>
      )}

      {/* ── Modal création ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Nouvelle collecte de déchets</h2>
              <button type="button" aria-label="Fermer" onClick={() => setShowForm(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              {/* Type de déchet */}
              <div className="col-span-2">
                <label htmlFor="r-type" className="text-sm text-gray-600">Type de déchet *</label>
                <select
                  id="r-type"
                  value={form.typeDechet}
                  onChange={(e) => setForm({ ...form, typeDechet: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">— Sélectionner un type —</option>
                  {TYPES_DECHETS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Quantité */}
              <div>
                <label htmlFor="r-qte" className="text-sm text-gray-600">Quantité *</label>
                <input
                  id="r-qte"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                  placeholder="0.00"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Unité */}
              <div>
                <label htmlFor="r-unite" className="text-sm text-gray-600">Unité</label>
                <select
                  id="r-unite"
                  value={form.unite}
                  onChange={(e) => setForm({ ...form, unite: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="tonne">tonne</option>
                  <option value="litre">litre</option>
                  <option value="m3">m³</option>
                  <option value="unité">unité</option>
                </select>
              </div>

              {/* Collecteur */}
              <div className="col-span-2">
                <label htmlFor="r-collecteur" className="text-sm text-gray-600">Collecteur / Entreprise</label>
                <input
                  id="r-collecteur"
                  type="text"
                  value={form.collecteur}
                  onChange={(e) => setForm({ ...form, collecteur: e.target.value })}
                  placeholder="ex: SONAGED, Collecte interne…"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Adresse source */}
              <div className="col-span-2">
                <label htmlFor="r-adresse" className="text-sm text-gray-600">Adresse de collecte</label>
                <input
                  id="r-adresse"
                  type="text"
                  value={form.sourceAdresse}
                  onChange={(e) => setForm({ ...form, sourceAdresse: e.target.value })}
                  placeholder="ex: Zone industrielle Thiès"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label htmlFor="r-notes" className="text-sm text-gray-600">Notes</label>
                <textarea
                  id="r-notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Observations, conditions de collecte…"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={() => creerMutation.mutate({
                  ...form,
                  quantite: parseFloat(form.quantite),
                  sourceAdresse: form.sourceAdresse || undefined,
                  notes: form.notes || undefined,
                  collecteur: form.collecteur || undefined,
                })}
                disabled={!form.typeDechet || !form.quantite || creerMutation.isPending}
                className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {creerMutation.isPending ? 'Enregistrement...' : 'Enregistrer la collecte'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation suppression ────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Supprimer cette collecte ?</h3>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{formatType(confirmDelete.typeDechet)}</strong> — {Number(confirmDelete.quantite).toLocaleString('fr-FR')} {confirmDelete.unite || 'kg'}
            </p>
            <p className="text-xs text-gray-400 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => supprimerMutation.mutate(confirmDelete.id)}
                disabled={supprimerMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {supprimerMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
