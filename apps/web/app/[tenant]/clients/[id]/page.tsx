'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { usePermissions } from '@/lib/permissions-context';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, CreditCard,
  Clock, TrendingUp, ShoppingCart, FileText, Pencil, X, User,
} from 'lucide-react';

// ── Constantes ───────────────────────────────────────────────────────────────
const TYPES_CLIENT = ['industriel', 'agricole', 'alimentaire', 'distributeur', 'autre'] as const;

const TYPE_STYLES: Record<string, string> = {
  industriel:   'bg-blue-50 text-blue-700',
  agricole:     'bg-green-50 text-green-700',
  alimentaire:  'bg-orange-50 text-orange-700',
  distributeur: 'bg-purple-50 text-purple-700',
  autre:        'bg-gray-100 text-gray-600',
};

const STATUT_CLIENT_STYLES: Record<string, string> = {
  actif:    'bg-green-100 text-green-700',
  inactif:  'bg-gray-100 text-gray-500',
  prospect: 'bg-yellow-100 text-yellow-700',
};

const CMD_STATUTS: Record<string, { label: string; cls: string }> = {
  brouillon:     { label: 'Brouillon',     cls: 'bg-gray-100 text-gray-600' },
  confirmee:     { label: 'Confirmée',     cls: 'bg-blue-100 text-blue-700' },
  en_production: { label: 'En production', cls: 'bg-orange-100 text-orange-700' },
  prete:         { label: 'Prête',         cls: 'bg-yellow-100 text-yellow-800' },
  livree:        { label: 'Livrée',        cls: 'bg-green-100 text-green-700' },
  facturee:      { label: 'Facturée',      cls: 'bg-purple-100 text-purple-700' },
  annulee:       { label: 'Annulée',       cls: 'bg-red-100 text-red-600' },
};

const FAC_STATUTS: Record<string, { label: string; cls: string }> = {
  brouillon: { label: 'Brouillon',   cls: 'bg-gray-100 text-gray-600' },
  envoyee:   { label: 'Envoyée',     cls: 'bg-blue-100 text-blue-700' },
  partielle: { label: 'Part. payée', cls: 'bg-yellow-100 text-yellow-800' },
  payee:     { label: 'Payée',       cls: 'bg-green-100 text-green-700' },
  en_retard: { label: 'En retard',   cls: 'bg-red-100 text-red-600' },
  annulee:   { label: 'Annulée',     cls: 'bg-red-100 text-red-600' },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Client {
  id: string;
  nom: string;
  type?: string;
  statut?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  ninea?: string;
  contact?: string;
  plafondCredit?: number;
  delaiPaiement?: number;
  totalCA: number;
  commandesActives: number;
  encoursFactures: number;
}

interface Commande {
  id: string;
  reference: string;
  statut: string;
  totalHT: number;
  totalTTC: number;
  createdAt: string;
  _count?: { lignes: number };
}

interface Facture {
  id: string;
  reference: string;
  statut: string;
  montantTTC: number;
  montantPaye: number;
  dateEcheance?: string;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtMontant = (n: number) =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Info cell helper ──────────────────────────────────────────────────────────
function InfoCell({ label, value, icon }: { label: string; value?: string | number | null; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-sm font-medium text-gray-700">{value ?? '—'}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const clientId = params.id as string;
  const tenant = params.tenant as string;
  const [activeTab, setActiveTab] = useState<'commandes' | 'factures'>('commandes');
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', type: '', email: '', telephone: '',
    adresse: '', ville: '', ninea: '', statut: 'actif',
    contact: '', plafondCredit: '', delaiPaiement: '',
  });
  const { peutEcrire } = usePermissions('crm');

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ['client', clientId],
    queryFn: async () => (await api.get(`/crm/clients/${clientId}`)).data,
  });

  const { data: commandesData } = useQuery({
    queryKey: ['client-commandes', clientId],
    queryFn: async () =>
      (await api.get(`/crm/clients/${clientId}/commandes`, { params: { limite: 50 } })).data,
  });

  const { data: facturesData } = useQuery({
    queryKey: ['client-factures', clientId],
    queryFn: async () =>
      (await api.get(`/crm/clients/${clientId}/factures`, { params: { limite: 50 } })).data,
    enabled: activeTab === 'factures',
  });

  const modifierMutation = useMutation({
    mutationFn: (d: typeof formData) =>
      api.put(`/crm/clients/${clientId}`, {
        ...d,
        plafondCredit: d.plafondCredit ? +d.plafondCredit : undefined,
        delaiPaiement: d.delaiPaiement ? +d.delaiPaiement : undefined,
        type: d.type || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client', clientId] });
      setShowEdit(false);
      toast.success('Client mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const ouvrirEdit = () => {
    if (!client) return;
    setFormData({
      nom: client.nom,
      type: client.type ?? '',
      email: client.email ?? '',
      telephone: client.telephone ?? '',
      adresse: client.adresse ?? '',
      ville: client.ville ?? '',
      ninea: client.ninea ?? '',
      statut: client.statut ?? 'actif',
      contact: client.contact ?? '',
      plafondCredit: client.plafondCredit?.toString() ?? '',
      delaiPaiement: client.delaiPaiement?.toString() ?? '',
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

  if (!client) {
    return <div className="text-center py-16 text-gray-400">Client introuvable</div>;
  }

  const encours = client.encoursFactures ?? 0;
  const tauxEncours =
    client.plafondCredit && client.plafondCredit > 0
      ? Math.min(100, (encours / client.plafondCredit) * 100)
      : null;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${tenant}/clients`)}
          className="mt-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
              {client.nom.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{client.nom}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {client.type && (
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${TYPE_STYLES[client.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {client.type}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_CLIENT_STYLES[client.statut ?? 'actif'] ?? 'bg-gray-100 text-gray-600'}`}>
                  {client.statut ?? 'actif'}
                </span>
                {client.ville && (
                  <span className="text-xs text-gray-400 flex items-center gap-0.5">
                    <MapPin size={10} /> {client.ville}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {peutEcrire && (
          <button
            type="button"
            onClick={ouvrirEdit}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 text-gray-600 whitespace-nowrap"
          >
            <Pencil size={14} /> Modifier
          </button>
        )}
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <TrendingUp size={13} /> CA total (livrées / facturées)
          </div>
          <p className="text-xl font-bold text-gray-800">{fmtMontant(client.totalCA ?? 0)}</p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <Clock size={13} /> Encours factures
          </div>
          <p className={`text-xl font-bold ${encours > 0 ? 'text-orange-600' : 'text-gray-800'}`}>
            {fmtMontant(encours)}
          </p>
          {tauxEncours !== null && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Plafond : {fmtMontant(client.plafondCredit!)}</span>
                <span>{Math.round(tauxEncours)} %</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    tauxEncours > 80 ? 'bg-red-500' : tauxEncours > 50 ? 'bg-orange-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${tauxEncours}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <ShoppingCart size={13} /> Commandes actives
          </div>
          <p className="text-xl font-bold text-gray-800">{client.commandesActives ?? 0}</p>
          {client.delaiPaiement != null && (
            <p className="text-xs text-gray-400 mt-1">Délai paiement : {client.delaiPaiement} jours</p>
          )}
        </div>
      </div>

      {/* ── Infos client ── */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Informations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
          <InfoCell label="Contact principal" value={client.contact} icon={<User size={10} />} />
          <InfoCell label="Email" value={client.email} icon={<Mail size={10} />} />
          <InfoCell label="Téléphone" value={client.telephone} icon={<Phone size={10} />} />
          <InfoCell
            label="Adresse"
            value={[client.adresse, client.ville].filter(Boolean).join(', ') || undefined}
            icon={<Building2 size={10} />}
          />
          <InfoCell label="Ville" value={client.ville} icon={<MapPin size={10} />} />
          <InfoCell label="NINEA" value={client.ninea} />
          <InfoCell
            label="Plafond crédit"
            value={client.plafondCredit != null ? fmtMontant(client.plafondCredit) : undefined}
            icon={<CreditCard size={10} />}
          />
          <InfoCell
            label="Délai paiement"
            value={client.delaiPaiement != null ? `${client.delaiPaiement} jours` : undefined}
            icon={<Clock size={10} />}
          />
        </div>
      </div>

      {/* ── Onglets Commandes / Factures ── */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="flex border-b px-4">
          {(['commandes', 'factures'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'commandes' ? <ShoppingCart size={14} /> : <FileText size={14} />}
              {tab === 'commandes' ? 'Commandes' : 'Factures'}
              <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {tab === 'commandes' ? (commandesData?.total ?? '…') : (facturesData?.total ?? '…')}
              </span>
            </button>
          ))}
        </div>

        {/* Onglet Commandes */}
        {activeTab === 'commandes' && (
          <div>
            {commandesData?.totalCA !== undefined && (
              <div className="px-5 py-2 bg-blue-50 text-xs text-blue-700 font-medium border-b">
                CA total (livrées / facturées) : {fmtMontant(commandesData.totalCA)}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Référence</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Statut</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total HT</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total TTC</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Lignes</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {commandesData?.items?.map((cmd: Commande) => {
                    const s = CMD_STATUTS[cmd.statut] ?? { label: cmd.statut, cls: 'bg-gray-100 text-gray-600' };
                    return (
                      <tr key={cmd.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => router.push(`/${tenant}/commandes/${cmd.id}`)}
                            className="font-medium text-sm text-blue-700 hover:underline hover:text-blue-900"
                          >
                            {cmd.reference}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {fmtMontant(Number(cmd.totalHT))}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                          {fmtMontant(Number(cmd.totalTTC))}
                        </td>
                        <td className="px-4 py-3 text-xs text-center text-gray-500">
                          {cmd._count?.lignes ?? 0}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(cmd.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!commandesData?.items?.length && (
                <p className="text-center py-10 text-gray-400 text-sm">Aucune commande</p>
              )}
            </div>
          </div>
        )}

        {/* Onglet Factures */}
        {activeTab === 'factures' && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Référence</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Montant TTC</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Payé</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Restant dû</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Échéance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {facturesData?.items?.map((fac: Facture) => {
                  const restant = fac.montantTTC - fac.montantPaye;
                  const enRetard =
                    fac.dateEcheance && new Date(fac.dateEcheance) < new Date() && restant > 0;
                  const s = FAC_STATUTS[fac.statut] ?? { label: fac.statut, cls: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={fac.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/${tenant}/facturation/${fac.id}`)}
                          className="font-medium text-sm text-blue-700 hover:underline hover:text-blue-900"
                        >
                          {fac.reference}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {fmtMontant(fac.montantTTC)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        {fmtMontant(fac.montantPaye)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        <span className={restant > 0 ? 'text-red-600' : 'text-green-600'}>
                          {fmtMontant(restant)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs ${enRetard ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                        {fac.dateEcheance ? fmtDate(fac.dateEcheance) : '—'}
                        {enRetard && ' ⚠'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!facturesData?.items?.length && (
              <p className="text-center py-10 text-gray-400 text-sm">Aucune facture</p>
            )}
          </div>
        )}
      </div>

      {/* ── Modale édition ── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-800">Modifier le client</h2>
              <button type="button" aria-label="Fermer" onClick={() => setShowEdit(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="e-nom" className="text-sm text-gray-600">Nom *</label>
                <input id="e-nom" type="text" value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="e-type" className="text-sm text-gray-600">Type de client</label>
                <select id="e-type" value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">— Sélectionner —</option>
                  {TYPES_CLIENT.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="e-statut" className="text-sm text-gray-600">Statut</label>
                <select id="e-statut" value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="actif">Actif</option>
                  <option value="prospect">Prospect</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
              <div>
                <label htmlFor="e-email" className="text-sm text-gray-600">Email</label>
                <input id="e-email" type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="e-tel" className="text-sm text-gray-600">Téléphone</label>
                <input id="e-tel" type="tel" value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="e-contact" className="text-sm text-gray-600">Contact principal</label>
                <input id="e-contact" type="text" value={formData.contact}
                  placeholder="Mamadou Diallo"
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="e-ninea" className="text-sm text-gray-600">NINEA</label>
                <input id="e-ninea" type="text" value={formData.ninea}
                  onChange={(e) => setFormData({ ...formData, ninea: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label htmlFor="e-adresse" className="text-sm text-gray-600">Adresse</label>
                <input id="e-adresse" type="text" value={formData.adresse}
                  placeholder="Zone Industrielle, Dakar"
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="e-ville" className="text-sm text-gray-600">Ville</label>
                <input id="e-ville" type="text" value={formData.ville}
                  placeholder="Dakar"
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="e-plafond" className="text-sm text-gray-600">Plafond crédit (FCFA)</label>
                <input id="e-plafond" type="number" min="0" value={formData.plafondCredit}
                  onChange={(e) => setFormData({ ...formData, plafondCredit: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="e-delai" className="text-sm text-gray-600">Délai paiement (jours)</label>
                <input id="e-delai" type="number" min="0" max="365" value={formData.delaiPaiement}
                  onChange={(e) => setFormData({ ...formData, delaiPaiement: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={() => modifierMutation.mutate(formData)}
                disabled={!formData.nom || modifierMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
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
