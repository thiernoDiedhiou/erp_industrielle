'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, X, MapPin, Truck, Package, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Client { id: string; nom: string; ville?: string; adresse?: string; }
interface Commande { id: string; reference: string; }
interface LigneLivraison { produitId: string; quantite: number; description?: string; }

interface BonLivraison {
  id: string;
  reference: string;
  statut: string;
  adresseLivraison?: string;
  transporteur?: string;
  dateExpedition?: string;
  dateLivraison?: string;
  notes?: string;
  client: { id: string; nom: string; ville?: string };
  commande?: { id: string; reference: string };
  _count?: { lignes: number };
}

const STATUTS = ['prepare', 'expedie', 'livre', 'annule'];

const STATUT_CONFIG: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
  prepare:  { label: 'Préparé',  style: 'bg-yellow-50 text-yellow-700', icon: <Clock size={12} /> },
  expedie:  { label: 'Expédié',  style: 'bg-blue-50 text-blue-700',     icon: <Truck size={12} /> },
  livre:    { label: 'Livré',    style: 'bg-green-50 text-green-700',   icon: <CheckCircle size={12} /> },
  annule:   { label: 'Annulé',   style: 'bg-red-50 text-red-700',       icon: <XCircle size={12} /> },
};

const TRANSITIONS: Record<string, string[]> = {
  prepare: ['expedie', 'annule'],
  expedie: ['livre', 'annule'],
  livre:   [],
  annule:  [],
};

const FORM_VIDE = {
  clientId: '', commandeId: '', adresseLivraison: '', transporteur: '',
  dateExpedition: '', notes: '',
};

export default function LogistiquePage() {
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [modal, setModal] = useState<'create' | null>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const qc = useQueryClient();
  const toast = useToast();

  const { data: stats } = useQuery({
    queryKey: ['logistique-stats'],
    queryFn: async () => (await api.get('/logistique/stats')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['bons-livraison', search, filtreStatut],
    queryFn: async () =>
      (await api.get('/logistique/bons-livraison', { params: { search, statut: filtreStatut || undefined, limite: 50 } })).data,
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients-select'],
    queryFn: async () => (await api.get('/crm/clients', { params: { limite: 100 } })).data,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => api.post('/logistique/bons-livraison', {
      ...d,
      commandeId: d.commandeId || undefined,
      dateExpedition: d.dateExpedition || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bons-livraison'] });
      qc.invalidateQueries({ queryKey: ['logistique-stats'] });
      setModal(null);
      setFormData(FORM_VIDE);
      toast.success('Bon de livraison créé');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const changerStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      api.patch(`/logistique/bons-livraison/${id}/statut`, { statut }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bons-livraison'] });
      qc.invalidateQueries({ queryKey: ['logistique-stats'] });
      toast.success('Statut mis à jour');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Transition non autorisée'),
  });

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Logistique & Livraisons</h1>
        <button type="button" onClick={() => { setFormData(FORM_VIDE); setModal('create'); }}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          <Plus size={16} /> Nouveau BL
        </button>
      </div>

      {/* KPIs statuts */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STATUT_CONFIG).map(([key, cfg]) => (
            <div key={key} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${cfg.style}`}>{cfg.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{cfg.label}</p>
                <p className="font-bold text-gray-800 text-lg">{stats[key] ?? 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un BL, client, transporteur..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{STATUT_CONFIG[s]?.label ?? s}</option>)}
        </select>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Référence</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Transporteur</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Expédition</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Lignes</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                  <th scope="col" className="px-4 py-3 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.items?.map((bl: BonLivraison) => {
                  const cfg = STATUT_CONFIG[bl.statut];
                  const transitions = TRANSITIONS[bl.statut] ?? [];
                  return (
                    <tr key={bl.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Package size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">{bl.reference}</p>
                            {bl.commande && <p className="text-xs text-gray-400">↳ {bl.commande.reference}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-800">{bl.client.nom}</p>
                        {bl.adresseLivraison && (
                          <p className="text-xs text-gray-400 flex items-center gap-0.5">
                            <MapPin size={10} /> {bl.adresseLivraison}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bl.transporteur ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {bl.dateExpedition ? fmt(bl.dateExpedition) : '—'}
                        {bl.dateLivraison && <p className="text-xs text-green-600">Livré le {fmt(bl.dateLivraison)}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-gray-700">
                        {bl._count?.lignes ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${cfg?.style}`}>
                          {cfg?.icon} {cfg?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {transitions.length > 0 && (
                          <div className="flex gap-1">
                            {transitions.map((t) => (
                              <button key={t} type="button"
                                onClick={() => changerStatutMutation.mutate({ id: bl.id, statut: t })}
                                className={`text-xs px-2 py-1 rounded border hover:opacity-80 ${STATUT_CONFIG[t]?.style}`}>
                                → {STATUT_CONFIG[t]?.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data?.items?.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucun bon de livraison trouvé</div>
          )}
        </div>
      )}

      {/* Modal création BL */}
      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-800">Nouveau bon de livraison</h2>
              <button type="button" aria-label="Fermer" onClick={() => setModal(null)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="field-clientId" className="text-sm text-gray-600">Client *</label>
                <select id="field-clientId" value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">— Sélectionner un client —</option>
                  {clientsData?.items?.map((c: Client) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="field-adresse" className="text-sm text-gray-600">Adresse de livraison</label>
                <input id="field-adresse" type="text" value={formData.adresseLivraison}
                  onChange={(e) => setFormData({ ...formData, adresseLivraison: e.target.value })}
                  placeholder="Zone industrielle, Dakar..."
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-transporteur" className="text-sm text-gray-600">Transporteur</label>
                <input id="field-transporteur" type="text" value={formData.transporteur}
                  onChange={(e) => setFormData({ ...formData, transporteur: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-dateExp" className="text-sm text-gray-600">Date expédition prévue</label>
                <input id="field-dateExp" type="date" value={formData.dateExpedition}
                  onChange={(e) => setFormData({ ...formData, dateExpedition: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label htmlFor="field-notes" className="text-sm text-gray-600">Notes</label>
                <textarea id="field-notes" rows={2} value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button"
                onClick={() => creerMutation.mutate(formData)}
                disabled={!formData.clientId || creerMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                {creerMutation.isPending ? 'Création...' : 'Créer le BL'}
              </button>
              <button type="button" onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
