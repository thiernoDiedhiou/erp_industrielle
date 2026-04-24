'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft, Truck, MapPin, Package, CheckCircle,
  Clock, XCircle, User, Car, FileText, ExternalLink, Pencil, X,
} from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

interface LigneLivraison {
  id: string;
  quantite: number;
  description?: string;
  produit: { id: string; nom: string; reference?: string; unite?: string };
}

interface BonLivraison {
  id: string;
  reference: string;
  statut: string;
  adresseLivraison?: string;
  transporteur?: string;
  chauffeur?: string;
  vehicule?: string;
  dateExpedition?: string;
  dateLivraison?: string;
  notes?: string;
  createdAt: string;
  client: { id: string; nom: string; ville?: string; adresse?: string; telephone?: string };
  commande?: { id: string; reference: string };
  lignes: LigneLivraison[];
}

const STATUT_CONFIG: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
  prepare:  { label: 'Préparé',  style: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock size={14} /> },
  expedie:  { label: 'Expédié',  style: 'bg-blue-50 text-blue-700 border-blue-200',       icon: <Truck size={14} /> },
  livre:    { label: 'Livré',    style: 'bg-green-50 text-green-700 border-green-200',    icon: <CheckCircle size={14} /> },
  annule:   { label: 'Annulé',   style: 'bg-red-50 text-red-700 border-red-200',          icon: <XCircle size={14} /> },
};

const TRANSITIONS: Record<string, { statut: string; label: string; style: string }[]> = {
  prepare: [
    { statut: 'expedie', label: 'Marquer expédié',    style: 'bg-blue-700 text-white hover:bg-blue-800' },
    { statut: 'annule',  label: 'Annuler',             style: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' },
  ],
  expedie: [
    { statut: 'livre',  label: 'Confirmer livraison', style: 'bg-green-700 text-white hover:bg-green-800' },
    { statut: 'annule', label: 'Annuler',              style: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' },
  ],
  livre:  [],
  annule: [],
};

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const toDateInput = (d?: string) =>
  d ? new Date(d).toISOString().split('T')[0] : '';

const FORM_VIDE = {
  transporteur: '',
  chauffeur: '',
  vehicule: '',
  adresseLivraison: '',
  dateExpedition: '',
  notes: '',
};

export default function BonLivraisonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const { peutEcrire } = usePermissions('logistique');

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(FORM_VIDE);

  const { data: bl, isLoading } = useQuery<BonLivraison>({
    queryKey: ['bon-livraison', params.id],
    queryFn: async () => (await api.get(`/logistique/bons-livraison/${params.id}`)).data,
  });

  const changerStatutMutation = useMutation({
    mutationFn: (statut: string) =>
      api.patch(`/logistique/bons-livraison/${params.id}/statut`, { statut }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bon-livraison', params.id] });
      qc.invalidateQueries({ queryKey: ['bons-livraison'] });
      toast.success('Statut mis à jour');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur'),
  });

  const modifierMutation = useMutation({
    mutationFn: (data: typeof editForm) =>
      api.put(`/logistique/bons-livraison/${params.id}`, {
        ...data,
        dateExpedition: data.dateExpedition || undefined,
        adresseLivraison: data.adresseLivraison || undefined,
        transporteur: data.transporteur || undefined,
        chauffeur: data.chauffeur || undefined,
        vehicule: data.vehicule || undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bon-livraison', params.id] });
      qc.invalidateQueries({ queryKey: ['bons-livraison'] });
      setShowEdit(false);
      toast.success('Bon de livraison mis à jour');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur'),
  });

  const ouvrirEdit = () => {
    if (!bl) return;
    setEditForm({
      transporteur:     bl.transporteur      ?? '',
      chauffeur:        bl.chauffeur         ?? '',
      vehicule:         bl.vehicule          ?? '',
      adresseLivraison: bl.adresseLivraison  ?? '',
      dateExpedition:   toDateInput(bl.dateExpedition),
      notes:            bl.notes             ?? '',
    });
    setShowEdit(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!bl) {
    return <div className="text-center py-16 text-gray-400">Bon de livraison introuvable</div>;
  }

  const cfg = STATUT_CONFIG[bl.statut];
  const transitions = TRANSITIONS[bl.statut] ?? [];
  const peutModifier = peutEcrire && (bl.statut === 'prepare' || bl.statut === 'expedie');

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button type="button" aria-label="Retour"
          onClick={() => router.push(`/${params.tenant}/logistique`)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-800">{bl.reference}</h1>
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg?.style}`}>
              {cfg?.icon} {cfg?.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Créé le {fmt(bl.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bouton modifier */}
          {peutModifier && (
            <button type="button" onClick={ouvrirEdit}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 text-gray-600">
              <Pencil size={14} /> Modifier
            </button>
          )}
          {/* Transitions de statut */}
          {peutEcrire && transitions.map((t) => (
            <button key={t.statut} type="button"
              onClick={() => changerStatutMutation.mutate(t.statut)}
              disabled={changerStatutMutation.isPending}
              className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${t.style}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Lignes de livraison */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Package size={15} className="text-gray-500" />
              <h2 className="font-semibold text-gray-700 text-sm">Articles livrés</h2>
              <span className="ml-auto text-xs text-gray-400">{bl.lignes.length} ligne(s)</span>
            </div>
            {bl.lignes.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Aucune ligne</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Produit</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bl.lignes.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-800">{l.produit.nom}</p>
                        {l.produit.reference && <p className="text-xs text-gray-400">{l.produit.reference}</p>}
                        {l.description && <p className="text-xs text-gray-500 mt-0.5 italic">{l.description}</p>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-semibold text-sm text-gray-800">{Number(l.quantite)}</span>
                        {l.produit.unite && <span className="text-xs text-gray-400 ml-1">{l.produit.unite}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes */}
          {bl.notes && (
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Notes</h3>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{bl.notes}</p>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Client */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Client</h3>
            <p className="font-medium text-gray-800">{bl.client.nom}</p>
            {bl.client.ville && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={12} /> {bl.client.ville}
              </p>
            )}
            {bl.adresseLivraison && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-400 mb-0.5">Adresse de livraison</p>
                <p className="text-sm text-gray-600">{bl.adresseLivraison}</p>
              </div>
            )}
          </div>

          {/* Commande liée */}
          {bl.commande && (
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Commande liée</h3>
              <button type="button"
                onClick={() => router.push(`/${params.tenant}/commandes/${bl.commande!.id}`)}
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm font-medium">
                <ExternalLink size={13} />
                {bl.commande.reference}
              </button>
            </div>
          )}

          {/* Transport */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Transport</h3>
              {peutModifier && (
                <button type="button" onClick={ouvrirEdit}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Pencil size={11} /> Renseigner
                </button>
              )}
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <Truck size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Transporteur</p>
                  <p className={`font-medium ${bl.transporteur ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                    {bl.transporteur ?? 'Non renseigné'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Chauffeur</p>
                  <p className={`font-medium ${bl.chauffeur ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                    {bl.chauffeur ?? 'Non renseigné'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Car size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Véhicule</p>
                  <p className={`font-medium ${bl.vehicule ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                    {bl.vehicule ?? 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendrier */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Calendrier</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Expédition prévue</span>
                <span className={`font-medium ${bl.dateExpedition ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                  {bl.dateExpedition ? fmt(bl.dateExpedition) : 'Non renseignée'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Livraison réelle</span>
                <span className={`font-medium ${bl.dateLivraison ? 'text-green-700' : 'text-gray-300 italic'}`}>
                  {bl.dateLivraison ? fmt(bl.dateLivraison) : 'Non confirmée'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal d'édition ── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Modifier le bon de livraison</h2>
              <button type="button" aria-label="Fermer" onClick={() => setShowEdit(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="edit-adresse" className="text-sm text-gray-600">Adresse de livraison</label>
                <input id="edit-adresse" type="text"
                  value={editForm.adresseLivraison}
                  onChange={(e) => setEditForm((f) => ({ ...f, adresseLivraison: e.target.value }))}
                  placeholder="Zone industrielle, Dakar..."
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="edit-transporteur" className="text-sm text-gray-600">Transporteur</label>
                <input id="edit-transporteur" type="text"
                  value={editForm.transporteur}
                  onChange={(e) => setEditForm((f) => ({ ...f, transporteur: e.target.value }))}
                  placeholder="Nom de la société de transport"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="edit-date" className="text-sm text-gray-600">Date d'expédition prévue</label>
                <input id="edit-date" type="date"
                  value={editForm.dateExpedition}
                  onChange={(e) => setEditForm((f) => ({ ...f, dateExpedition: e.target.value }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="edit-chauffeur" className="text-sm text-gray-600">Chauffeur</label>
                <input id="edit-chauffeur" type="text"
                  value={editForm.chauffeur}
                  onChange={(e) => setEditForm((f) => ({ ...f, chauffeur: e.target.value }))}
                  placeholder="Prénom Nom"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="edit-vehicule" className="text-sm text-gray-600">Immatriculation véhicule</label>
                <input id="edit-vehicule" type="text"
                  value={editForm.vehicule}
                  onChange={(e) => setEditForm((f) => ({ ...f, vehicule: e.target.value }))}
                  placeholder="ex : DK-1234-TH"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label htmlFor="edit-notes" className="text-sm text-gray-600">Notes</label>
                <textarea id="edit-notes" rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Instructions de livraison, fragile, etc."
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button"
                onClick={() => modifierMutation.mutate(editForm)}
                disabled={modifierMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50 font-medium">
                {modifierMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowEdit(false)}
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
