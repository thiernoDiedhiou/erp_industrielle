'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Factory, Play, Pause, CheckSquare, Plus, X } from 'lucide-react';

const STATUTS_COULEURS: Record<string, string> = {
  planifie: 'bg-gray-100 text-gray-700',
  en_cours: 'bg-orange-100 text-orange-700',
  en_pause: 'bg-yellow-100 text-yellow-700',
  termine: 'bg-green-100 text-green-700',
  annule: 'bg-red-100 text-red-700',
};

const FORM_VIDE = { produitFini: '', quantitePrevue: '', dateDebut: '', dateFin: '', machineId: '', commandeId: '' };

interface OF {
  id: string;
  reference: string;
  statut: string;
  produitFini: string;
  quantitePrevue: number;
  machine?: { nom: string };
  commande?: { reference: string };
}

export default function ProductionPage() {
  const [filtreStatut, setFiltreStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['ofs', filtreStatut],
    queryFn: async () => {
      const { data } = await api.get('/production/ofs', {
        params: { statut: filtreStatut || undefined },
      });
      return data;
    },
  });

  const { data: machines } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data } = await api.get('/production/machines');
      return data;
    },
  });

  const { data: commandes } = useQuery({
    queryKey: ['commandes-confirmees'],
    queryFn: async () => {
      const { data } = await api.get('/commandes', { params: { statut: 'confirmee', limite: 50 } });
      return data;
    },
  });

  const creerMutation = useMutation({
    mutationFn: (d: object) => api.post('/production/ofs', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ofs'] });
      setShowModal(false);
      setForm(FORM_VIDE);
      toast.success('Ordre de fabrication créé');
    },
    onError: () => toast.error('Erreur lors de la création de l\'OF'),
  });

  const changerStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      api.put(`/production/ofs/${id}/statut`, { statut }),
    onSuccess: (_, { statut }) => {
      queryClient.invalidateQueries({ queryKey: ['ofs'] });
      const labels: Record<string, string> = { en_cours: 'démarré', termine: 'terminé', en_pause: 'mis en pause' };
      toast.success(`OF ${labels[statut] ?? 'mis à jour'}`);
    },
    onError: () => toast.error('Erreur lors du changement de statut'),
  });

  const soumettre = () => {
    creerMutation.mutate({
      produitFini: form.produitFini,
      quantitePrevue: Number(form.quantitePrevue),
      dateDebut: form.dateDebut || undefined,
      dateFin: form.dateFin || undefined,
      machineId: form.machineId || undefined,
      commandeId: form.commandeId || undefined,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Production</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          <Plus size={16} />
          Nouvel OF
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {[['', 'Tous'], ['planifie', 'Planifié'], ['en_cours', 'En cours'], ['termine', 'Terminé']].map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setFiltreStatut(val)}
            className={`px-3 py-1 rounded-full text-xs border ${
              filtreStatut === val
                ? 'bg-blue-700 text-white border-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.items?.map((of: OF) => (
            <div key={of.id} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Factory size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{of.reference}</p>
                    <p className="text-sm text-gray-500">{of.produitFini}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${STATUTS_COULEURS[of.statut] || 'bg-gray-100'}`}>
                  {of.statut}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mt-3">
                <div>
                  <p className="text-xs text-gray-400">Quantité prévue</p>
                  <p className="font-medium">{of.quantitePrevue}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Machine</p>
                  <p className="font-medium">{of.machine?.nom || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Commande</p>
                  <p className="font-medium">{of.commande?.reference || '-'}</p>
                </div>
              </div>

              {/* Actions workflow */}
              <div className="flex gap-2 mt-3">
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
                      onClick={() => changerStatutMutation.mutate({ id: of.id, statut: 'termine' })}
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
            </div>
          ))}
          {data?.items?.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border">
              Aucun ordre de fabrication
            </div>
          )}
        </div>
      )}

      {/* Modal création OF */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Nouvel ordre de fabrication</h2>
              <button type="button" aria-label="Fermer" onClick={() => setShowModal(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="of-produit" className="text-sm text-gray-600">Produit fini *</label>
                <input
                  id="of-produit"
                  type="text"
                  value={form.produitFini}
                  onChange={(e) => setForm({ ...form, produitFini: e.target.value })}
                  placeholder="Ex: Film PE 100 microns"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="of-qte" className="text-sm text-gray-600">Quantité prévue *</label>
                <input
                  id="of-qte"
                  type="number"
                  value={form.quantitePrevue}
                  onChange={(e) => setForm({ ...form, quantitePrevue: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="of-machine" className="text-sm text-gray-600">Machine</label>
                <select
                  id="of-machine"
                  value={form.machineId}
                  onChange={(e) => setForm({ ...form, machineId: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Aucune —</option>
                  {machines?.items?.map((m: { id: string; nom: string }) => (
                    <option key={m.id} value={m.id}>{m.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="of-debut" className="text-sm text-gray-600">Date début</label>
                <input
                  id="of-debut"
                  type="date"
                  value={form.dateDebut}
                  onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="of-fin" className="text-sm text-gray-600">Date fin prévue</label>
                <input
                  id="of-fin"
                  type="date"
                  value={form.dateFin}
                  onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="of-commande" className="text-sm text-gray-600">Commande liée</label>
                <select
                  id="of-commande"
                  value={form.commandeId}
                  onChange={(e) => setForm({ ...form, commandeId: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Aucune —</option>
                  {commandes?.items?.map((c: { id: string; reference: string; client?: { nom: string } }) => (
                    <option key={c.id} value={c.id}>{c.reference} — {c.client?.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={soumettre}
                disabled={!form.produitFini || !form.quantitePrevue || creerMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {creerMutation.isPending ? 'Création...' : 'Créer l\'OF'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
