'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
  Factory, Play, Pause, CheckSquare, Plus, X, Eye,
  Calendar, AlertTriangle, Clock,
} from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

// ── Constantes ────────────────────────────────────────────────────────────────
const STATUTS: { val: string; label: string; cls: string }[] = [
  { val: '',         label: 'Tous',     cls: '' },
  { val: 'planifie', label: 'Planifié', cls: 'bg-gray-100 text-gray-700' },
  { val: 'en_cours', label: 'En cours', cls: 'bg-orange-100 text-orange-700' },
  { val: 'en_pause', label: 'En pause', cls: 'bg-yellow-100 text-yellow-700' },
  { val: 'termine',  label: 'Terminé',  cls: 'bg-green-100 text-green-700' },
  { val: 'annule',   label: 'Annulé',   cls: 'bg-red-100 text-red-700' },
];

const STATUT_MAP = Object.fromEntries(STATUTS.filter((s) => s.val).map((s) => [s.val, s]));

const FORM_VIDE = {
  produitId: '', produitFini: '', quantitePrevue: '',
  dateDebutPrevue: '', dateFinPrevue: '',
  machineId: '', commandeId: '', notes: '',
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface OF {
  id: string;
  reference: string;
  statut: string;
  produitFini: string;
  quantitePrevue: number;
  quantiteProduite?: number;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  dateDebut?: string;
  dateFin?: string;
  machine?: { nom: string };
  commande?: { id: string; reference: string; client?: { nom: string } } | null;
}

interface Compteur { statut: string; _count: { statut: number } }

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : null;

const estEnRetard = (of: OF) =>
  of.dateFinPrevue &&
  new Date(of.dateFinPrevue) < new Date() &&
  of.statut !== 'termine' &&
  of.statut !== 'annule';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductionPage() {
  const params = useParams();
  const router = useRouter();
  const [filtreStatut, setFiltreStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [terminerOF, setTerminerOF] = useState<OF | null>(null);
  const [quantiteProduite, setQuantiteProduite] = useState('');
  const qc = useQueryClient();
  const toast = useToast();
  const { peutEcrire } = usePermissions('production');

  const { data, isLoading } = useQuery({
    queryKey: ['ofs', filtreStatut],
    queryFn: async () =>
      (await api.get('/production/ofs', { params: { statut: filtreStatut || undefined, limite: 100 } })).data,
  });

  const { data: machines } = useQuery({
    queryKey: ['machines-liste'],
    queryFn: async () => (await api.get('/machines', { params: { limite: 100 } })).data,
  });

  const { data: produits } = useQuery({
    queryKey: ['produits-liste'],
    queryFn: async () => (await api.get('/crm/produits', { params: { limite: 100 } })).data,
  });

  const { data: commandes } = useQuery({
    queryKey: ['commandes-confirmees'],
    queryFn: async () =>
      (await api.get('/commandes', { params: { statut: 'confirmee', limite: 50 } })).data,
  });

  const creerMutation = useMutation({
    mutationFn: (d: object) => api.post('/production/ofs', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ofs'] });
      setShowModal(false);
      setForm(FORM_VIDE);
      toast.success('Ordre de fabrication créé');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Erreur lors de la création de l'OF"),
  });

  const changerStatutMutation = useMutation({
    mutationFn: ({ id, statut, quantiteProduite }: { id: string; statut: string; quantiteProduite?: number }) =>
      api.put(`/production/ofs/${id}/statut`, { statut, quantiteProduite }),
    onSuccess: (_, { statut }) => {
      qc.invalidateQueries({ queryKey: ['ofs'] });
      const labels: Record<string, string> = {
        en_cours: 'démarré', termine: 'terminé', en_pause: 'mis en pause', annule: 'annulé',
      };
      toast.success(`OF ${labels[statut] ?? 'mis à jour'}`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors du changement de statut'),
  });

  const soumettre = () => {
    if (!form.produitFini || !form.quantitePrevue || !form.produitId) return;
    creerMutation.mutate({
      produitId: form.produitId,
      produitFini: form.produitFini,
      quantitePrevue: Number(form.quantitePrevue),
      dateDebutPrevue: form.dateDebutPrevue || undefined,
      dateFinPrevue:   form.dateFinPrevue   || undefined,
      machineId:  form.machineId  || undefined,
      commandeId: form.commandeId || undefined,
      notes:      form.notes      || undefined,
    });
  };

  const confirmerTerminer = () => {
    if (!terminerOF) return;
    changerStatutMutation.mutate({
      id: terminerOF.id,
      statut: 'termine',
      quantiteProduite: quantiteProduite ? Number(quantiteProduite) : undefined,
    });
    setTerminerOF(null);
    setQuantiteProduite('');
  };

  const compteurs: Record<string, number> = {};
  (data?.compteurs as Compteur[] ?? []).forEach((c) => { compteurs[c.statut] = c._count.statut; });

  const ofs: OF[] = data?.items ?? [];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Production</h1>
        {peutEcrire && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
          >
            <Plus size={16} /> Nouvel OF
          </button>
        )}
      </div>

      {/* ── Compteurs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { statut: 'planifie', label: 'Planifiés',  bg: 'bg-gray-50  border-gray-200',   txt: 'text-gray-700'   },
          { statut: 'en_cours', label: 'En cours',   bg: 'bg-orange-50 border-orange-200', txt: 'text-orange-700' },
          { statut: 'en_pause', label: 'En pause',   bg: 'bg-yellow-50 border-yellow-200', txt: 'text-yellow-700' },
          { statut: 'termine',  label: 'Terminés',   bg: 'bg-green-50  border-green-200',  txt: 'text-green-700'  },
        ].map(({ statut, label, bg, txt }) => (
          <button
            key={statut}
            type="button"
            onClick={() => setFiltreStatut(filtreStatut === statut ? '' : statut)}
            className={`border rounded-xl p-3 text-left transition-all hover:shadow-sm ${bg} ${filtreStatut === statut ? 'ring-2 ring-blue-400' : ''}`}
          >
            <p className={`text-2xl font-bold ${txt}`}>{compteurs[statut] ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex gap-2 flex-wrap">
        {STATUTS.map(({ val, label }) => (
          <button
            key={val}
            type="button"
            onClick={() => setFiltreStatut(val)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filtreStatut === val
                ? 'bg-blue-700 text-white border-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Liste OFs ── */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="grid gap-4">
          {ofs.map((of) => {
            const retard = estEnRetard(of);
            const s = STATUT_MAP[of.statut];
            return (
              <div
                key={of.id}
                className={`bg-white rounded-xl border shadow-sm p-4 ${retard ? 'border-red-300' : ''}`}
              >
                {/* En-tête carte */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0">
                      <Factory size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => router.push(`/${params.tenant}/production/${of.id}`)}
                          className="font-semibold text-gray-800 hover:text-blue-700 hover:underline text-sm"
                        >
                          {of.reference}
                        </button>
                        {retard && (
                          <span className="flex items-center gap-0.5 text-xs text-red-600 font-medium">
                            <AlertTriangle size={11} /> En retard
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{of.produitFini}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
                    )}
                    <button
                      type="button"
                      aria-label="Voir le détail"
                      onClick={() => router.push(`/${params.tenant}/production/${of.id}`)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Infos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600">
                  <div>
                    <p className="text-xs text-gray-400">Qté prévue</p>
                    <p className="font-medium">{Number(of.quantitePrevue)}</p>
                    {of.quantiteProduite != null && Number(of.quantiteProduite) > 0 && (
                      <p className="text-xs text-green-600">Produite : {Number(of.quantiteProduite)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Machine</p>
                    <p className="font-medium">{of.machine?.nom || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Commande</p>
                    <p className="font-medium text-xs">
                      {of.commande
                        ? `${of.commande.reference}${of.commande.client ? ` — ${of.commande.client.nom}` : ''}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} /> Dates prévues</p>
                    <p className={`font-medium text-xs ${retard ? 'text-red-600' : ''}`}>
                      {fmtDate(of.dateDebutPrevue) ?? '—'}
                      {of.dateFinPrevue && ` → ${fmtDate(of.dateFinPrevue)}`}
                    </p>
                  </div>
                </div>

                {/* Actions workflow */}
                {peutEcrire && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {of.statut === 'planifie' && (
                      <button
                        type="button"
                        onClick={() => changerStatutMutation.mutate({ id: of.id, statut: 'en_cours' })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700"
                      >
                        <Play size={12} /> Démarrer
                      </button>
                    )}
                    {of.statut === 'en_cours' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setTerminerOF(of);
                            setQuantiteProduite(String(Number(of.quantitePrevue)));
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                        >
                          <CheckSquare size={12} /> Terminer
                        </button>
                        <button
                          type="button"
                          onClick={() => changerStatutMutation.mutate({ id: of.id, statut: 'en_pause' })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600"
                        >
                          <Pause size={12} /> Pause
                        </button>
                      </>
                    )}
                    {of.statut === 'en_pause' && (
                      <button
                        type="button"
                        onClick={() => changerStatutMutation.mutate({ id: of.id, statut: 'en_cours' })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700"
                      >
                        <Play size={12} /> Reprendre
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {ofs.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border">
              Aucun ordre de fabrication
            </div>
          )}
        </div>
      )}

      {/* ── Modal création OF ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-800">Nouvel ordre de fabrication</h2>
              <button type="button" aria-label="Fermer" onClick={() => setShowModal(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {/* Produit fini */}
              <div className="col-span-2">
                <label htmlFor="of-produit" className="text-sm text-gray-600">Produit fini *</label>
                <select
                  id="of-produit"
                  value={form.produitId}
                  onChange={(e) => {
                    const opt = produits?.items?.find((p: any) => p.id === e.target.value);
                    setForm({ ...form, produitId: e.target.value, produitFini: opt?.nom ?? '' });
                  }}
                  className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${!form.produitId ? 'border-orange-300' : ''}`}
                >
                  <option value="">— Sélectionner un produit —</option>
                  {produits?.items?.map((p: { id: string; nom: string; reference: string }) => (
                    <option key={p.id} value={p.id}>{p.nom} ({p.reference})</option>
                  ))}
                </select>
              </div>
              {/* Quantité */}
              <div>
                <label htmlFor="of-qte" className="text-sm text-gray-600">Quantité prévue *</label>
                <input
                  id="of-qte"
                  type="number"
                  min="1"
                  value={form.quantitePrevue}
                  onChange={(e) => setForm({ ...form, quantitePrevue: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Machine */}
              <div>
                <label htmlFor="of-machine" className="text-sm text-gray-600">Machine</label>
                <select
                  id="of-machine"
                  value={form.machineId}
                  onChange={(e) => setForm({ ...form, machineId: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— Aucune —</option>
                  {machines?.items?.map((m: { id: string; nom: string }) => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
              {/* Dates planifiées */}
              <div>
                <label htmlFor="of-debut" className="text-sm text-gray-600">Date début prévue</label>
                <input
                  id="of-debut"
                  type="date"
                  value={form.dateDebutPrevue}
                  onChange={(e) => setForm({ ...form, dateDebutPrevue: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="of-fin" className="text-sm text-gray-600">Date fin prévue</label>
                <input
                  id="of-fin"
                  type="date"
                  value={form.dateFinPrevue}
                  onChange={(e) => setForm({ ...form, dateFinPrevue: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Commande liée */}
              <div className="col-span-2">
                <label htmlFor="of-commande" className="text-sm text-gray-600">Commande liée</label>
                <select
                  id="of-commande"
                  value={form.commandeId}
                  onChange={(e) => setForm({ ...form, commandeId: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">— Aucune —</option>
                  {commandes?.items?.map((c: { id: string; reference: string; client?: { nom: string } }) => (
                    <option key={c.id} value={c.id}>
                      {c.reference}{c.client ? ` — ${c.client.nom}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {/* Notes */}
              <div className="col-span-2">
                <label htmlFor="of-notes" className="text-sm text-gray-600">Notes</label>
                <textarea
                  id="of-notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={soumettre}
                disabled={!form.produitId || !form.quantitePrevue || creerMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {creerMutation.isPending ? 'Création...' : "Créer l'OF"}
              </button>
              <button
                type="button"
                onClick={() => { setShowModal(false); setForm(FORM_VIDE); }}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal clôture OF ── */}
      {terminerOF && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckSquare size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Clôturer l'OF</h2>
                <p className="text-xs text-gray-500">{terminerOF.reference} — {terminerOF.produitFini}</p>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="qte-produite" className="text-sm text-gray-600">
                Quantité réellement produite
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="qte-produite"
                  type="number"
                  min="0"
                  value={quantiteProduite}
                  onChange={(e) => setQuantiteProduite(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  <Clock size={11} className="inline mr-0.5" />
                  Prévu : {Number(terminerOF.quantitePrevue)}
                </span>
              </div>
              {quantiteProduite && Number(quantiteProduite) < Number(terminerOF.quantitePrevue) && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={11} />
                  {Math.round((Number(quantiteProduite) / Number(terminerOF.quantitePrevue)) * 100)} % de la prévision
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmerTerminer}
                disabled={changerStatutMutation.isPending}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {changerStatutMutation.isPending ? 'Clôture...' : 'Confirmer la clôture'}
              </button>
              <button
                type="button"
                onClick={() => { setTerminerOF(null); setQuantiteProduite(''); }}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50"
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
