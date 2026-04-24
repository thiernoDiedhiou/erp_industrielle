import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Démarrage du seed SaaS ERP...');

  // ─── 0. Super Admin Innosoft ────────────────────────────────────────────────
  console.log('Création du super-admin Innosoft...');
  await (prisma as any).superAdmin.upsert({
    where: { email: 'admin@innosoft.sn' },
    update: {},
    create: {
      email: 'admin@innosoft.sn',
      passwordHash: await bcrypt.hash('InnoSoft2024!', 12),
      nom: 'Innosoft Creation',
      actif: true,
    },
  });
  console.log('✓ Super-admin créé : admin@innosoft.sn / InnoSoft2024!');

  // ─── 1. Modules plateforme ──────────────────────────────────────────────────
  console.log('Création des modules...');
  const modulesData = [
    { code: 'crm', nom: 'CRM & Clients', description: 'Gestion relation client', icon: 'users' },
    { code: 'commandes', nom: 'Commandes', description: 'Cycle de vie commandes', icon: 'clipboard-list' },
    { code: 'production', nom: 'Production', description: 'Ordres de fabrication', icon: 'factory' },
    { code: 'stock', nom: 'Stocks', description: 'Stocks MP et produits finis', icon: 'package' },
    { code: 'facturation', nom: 'Facturation', description: 'Factures et paiements', icon: 'receipt' },
    { code: 'recyclage', nom: 'Recyclage', description: 'Recyclage plastique', icon: 'recycle' },
    { code: 'reporting', nom: 'Reporting', description: 'KPIs et tableaux de bord', icon: 'bar-chart' },
    { code: 'fournisseurs', nom: 'Fournisseurs', description: 'Gestion des fournisseurs', icon: 'truck' },
    { code: 'machines', nom: 'Machines', description: 'Parc machines industriel', icon: 'settings' },
    { code: 'matieres-premieres', nom: 'Matières Premières', description: 'Gestion des MP', icon: 'layers' },
    { code: 'logistique', nom: 'Logistique', description: 'Bons de livraison et expéditions', icon: 'map-pin' },
  ];

  const modulesMap: Record<string, string> = {};
  for (const mod of modulesData) {
    const m = await prisma.module.upsert({
      where: { code: mod.code },
      update: { nom: mod.nom, description: mod.description },
      create: mod,
    });
    modulesMap[mod.code] = m.id;
  }

  // ─── 2. Tenant GISAC ────────────────────────────────────────────────────────
  console.log('Création du tenant GISAC...');
  const gisac = await prisma.tenant.upsert({
    where: { slug: 'gisac' },
    update: {},
    create: {
      slug: 'gisac',
      nom: 'GLOBAL INVEST SAMOURA & CO',
      secteur: 'plastique',
      plan: 'pro',
      couleurPrimaire: '#1565C0',
      couleurSecondaire: '#4CAF50',
      telephone: '33 999 01 79',
      adresse: 'Domaine Industriel, Thiès, 10e RIAOM',
      ville: 'Thiès',
      pays: 'SN',
    },
  });

  // ─── 3. Modules GISAC ───────────────────────────────────────────────────────
  for (const code of Object.keys(modulesMap)) {
    await prisma.tenantModule.upsert({
      where: { tenantId_moduleId: { tenantId: gisac.id, moduleId: modulesMap[code] } },
      update: { actif: true },
      create: { tenantId: gisac.id, moduleId: modulesMap[code], actif: true },
    });
  }

  // ─── 4. Settings GISAC ─────────────────────────────────────────────────────
  console.log('Création des settings...');
  const settingsData = [
    { cle: 'devise', valeur: 'XOF', label: 'Devise' },
    { cle: 'tva_default', valeur: '18', label: 'TVA (%)' },
    { cle: 'nom_entreprise', valeur: 'GLOBAL INVEST SAMOURA & CO', label: 'Nom entreprise' },
    { cle: 'prefixe_facture', valeur: 'FAC', label: 'Préfixe facture' },
    { cle: 'delai_paiement', valeur: '30', label: 'Délai paiement (j)' },
  ];
  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { tenantId_cle: { tenantId: gisac.id, cle: s.cle } },
      update: { valeur: s.valeur },
      create: { tenantId: gisac.id, ...s },
    });
  }

  // ─── 5. Enums GISAC ─────────────────────────────────────────────────────────
  console.log('Création des enums...');
  const enumsData = [
    { entite: 'client', code: 'industriel', libelle: 'Industriel', couleur: '#1565C0', ordre: 1 },
    { entite: 'client', code: 'agricole', libelle: 'Agricole', couleur: '#4CAF50', ordre: 2 },
    { entite: 'client', code: 'alimentaire', libelle: 'Alimentaire', couleur: '#FF9800', ordre: 3 },
    { entite: 'client', code: 'distributeur', libelle: 'Distributeur', couleur: '#9C27B0', ordre: 4 },
    { entite: 'produit', code: 'emballage', libelle: 'Emballage', couleur: '#1565C0', ordre: 1 },
    { entite: 'produit', code: 'film_plastique', libelle: 'Film Plastique', couleur: '#2196F3', ordre: 2 },
    { entite: 'produit', code: 'bache_agricole', libelle: 'Bâche Agricole', couleur: '#4CAF50', ordre: 3 },
    { entite: 'matiere', code: 'granule_pe', libelle: 'Granulé PE', couleur: '#1565C0', ordre: 1 },
    { entite: 'matiere', code: 'granule_pp', libelle: 'Granulé PP', couleur: '#2196F3', ordre: 2 },
    { entite: 'matiere', code: 'colorant', libelle: 'Colorant', couleur: '#9C27B0', ordre: 3 },
  ];
  for (const e of enumsData) {
    await prisma.customEnum.upsert({
      where: { tenantId_entite_code: { tenantId: gisac.id, entite: e.entite, code: e.code } },
      update: { libelle: e.libelle },
      create: { tenantId: gisac.id, ...e },
    });
  }

  // ─── 6. Workflow commandes GISAC ────────────────────────────────────────────
  console.log('Création du workflow commandes...');
  const wfId = 'workflow-commandes-gisac';
  const workflow = await prisma.workflowDefinition.upsert({
    where: { id: wfId },
    update: {},
    create: { id: wfId, tenantId: gisac.id, entite: 'commande', nom: 'Workflow Commandes GISAC', actif: true },
  });

  const statesData = [
    { code: 'brouillon', libelle: 'Brouillon', couleur: '#9E9E9E', etapInitiale: true, ordre: 1 },
    { code: 'confirmee', libelle: 'Confirmée', couleur: '#2196F3', ordre: 2 },
    { code: 'en_production', libelle: 'En Production', couleur: '#FF9800', ordre: 3 },
    { code: 'prete', libelle: 'Prête', couleur: '#8BC34A', ordre: 4 },
    { code: 'livree', libelle: 'Livrée', couleur: '#4CAF50', ordre: 5 },
    { code: 'facturee', libelle: 'Facturée', couleur: '#9C27B0', ordre: 6 },
    { code: 'annulee', libelle: 'Annulée', couleur: '#F44336', etapFinale: true, ordre: 7 },
  ];

  const statesMap: Record<string, string> = {};
  for (const s of statesData) {
    const st = await prisma.workflowState.upsert({
      where: { workflowId_code: { workflowId: workflow.id, code: s.code } },
      update: { libelle: s.libelle },
      create: {
        workflowId: workflow.id,
        code: s.code,
        libelle: s.libelle,
        couleur: s.couleur,
        etapInitiale: s.etapInitiale ?? false,
        etapFinale: s.etapFinale ?? false,
        ordre: s.ordre,
      },
    });
    statesMap[s.code] = st.id;
  }

  const transitionsData = [
    { from: 'brouillon', to: 'confirmee', libelle: 'Confirmer', roles: ['commercial', 'direction', 'admin'] },
    { from: 'confirmee', to: 'en_production', libelle: 'Lancer production', roles: ['production', 'direction', 'admin'] },
    { from: 'confirmee', to: 'livree', libelle: 'Livrer directement', roles: ['commercial', 'direction', 'admin'] },
    { from: 'en_production', to: 'prete', libelle: 'Marquer prête', roles: ['production', 'admin'] },
    { from: 'prete', to: 'livree', libelle: 'Livrer', roles: ['commercial', 'direction', 'admin'] },
    { from: 'livree', to: 'facturee', libelle: 'Facturer', roles: ['comptable', 'direction', 'admin'] },
    { from: 'brouillon', to: 'annulee', libelle: 'Annuler', roles: ['direction', 'admin'] },
    { from: 'confirmee', to: 'annulee', libelle: 'Annuler confirmée', roles: ['direction', 'admin'] },
  ];

  for (const t of transitionsData) {
    const existing = await prisma.workflowTransition.findFirst({
      where: { workflowId: workflow.id, etatSourceId: statesMap[t.from], etatCibleId: statesMap[t.to] },
    });
    if (!existing) {
      await prisma.workflowTransition.create({
        data: {
          workflowId: workflow.id,
          etatSourceId: statesMap[t.from],
          etatCibleId: statesMap[t.to],
          libelle: t.libelle,
          rolesAutorises: t.roles,
        },
      });
    }
  }

  // ─── 7. Utilisateurs GISAC (bcrypt facteur 12) ──────────────────────────────
  console.log('Création des utilisateurs...');
  const usersData = [
    { nom: 'Samoura', prenom: 'Oumar', email: 'admin@gisac.sn', password: 'Admin2025!', role: 'admin' },
    { nom: 'Diallo', prenom: 'Fatou', email: 'direction@gisac.sn', password: 'Direction2025!', role: 'direction' },
    { nom: 'Fall', prenom: 'Mamadou', email: 'commercial@gisac.sn', password: 'Commercial2025!', role: 'commercial' },
    { nom: 'Ndiaye', prenom: 'Aminata', email: 'production@gisac.sn', password: 'Prod2025!', role: 'production' },
    { nom: 'Sow', prenom: 'Ibrahim', email: 'magasinier@gisac.sn', password: 'Stock2025!', role: 'magasinier' },
    { nom: 'Mbaye', prenom: 'Rokhaya', email: 'comptable@gisac.sn', password: 'Compta2025!', role: 'comptable' },
  ];
  for (const u of usersData) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: gisac.id, email: u.email } },
      update: { passwordHash },
      create: { tenantId: gisac.id, nom: u.nom, prenom: u.prenom, email: u.email, passwordHash, role: u.role, actif: true },
    });
  }

  // ─── 8. Groupes & permissions GISAC ────────────────────────────────────────
  console.log('Création des groupes...');

  const tousModules = (lire: boolean, ecrire: boolean, supprimer: boolean) =>
    Object.fromEntries(
      ['crm','commandes','production','stock','facturation','recyclage','reporting',
       'fournisseurs','machines','matieres-premieres','logistique','bom'].map((m) => [
        m, { lire, ecrire, supprimer },
      ])
    );

  const groupesData = [
    {
      code: 'admin',
      nom: 'Administrateur',
      description: 'Accès complet à tous les modules et paramètres',
      permissions: tousModules(true, true, true),
    },
    {
      code: 'direction',
      nom: 'Direction',
      description: 'Lecture totale, validation commandes et accès reporting',
      permissions: {
        crm:                  { lire: true,  ecrire: true,  supprimer: false },
        commandes:            { lire: true,  ecrire: true,  supprimer: false },
        production:           { lire: true,  ecrire: false, supprimer: false },
        stock:                { lire: true,  ecrire: false, supprimer: false },
        facturation:          { lire: true,  ecrire: false, supprimer: false },
        recyclage:            { lire: true,  ecrire: false, supprimer: false },
        reporting:            { lire: true,  ecrire: false, supprimer: false },
        fournisseurs:         { lire: true,  ecrire: false, supprimer: false },
        machines:             { lire: true,  ecrire: false, supprimer: false },
        'matieres-premieres': { lire: true,  ecrire: false, supprimer: false },
        logistique:           { lire: true,  ecrire: false, supprimer: false },
        bom:                  { lire: true,  ecrire: false, supprimer: false },
      },
    },
    {
      code: 'commercial',
      nom: 'Commercial',
      description: 'CRM, Commandes, Logistique, Facturation (lecture)',
      permissions: {
        crm:                  { lire: true,  ecrire: true,  supprimer: false },
        commandes:            { lire: true,  ecrire: true,  supprimer: false },
        production:           { lire: true,  ecrire: false, supprimer: false },
        stock:                { lire: true,  ecrire: false, supprimer: false },
        facturation:          { lire: true,  ecrire: false, supprimer: false },
        recyclage:            { lire: false, ecrire: false, supprimer: false },
        reporting:            { lire: false, ecrire: false, supprimer: false },
        fournisseurs:         { lire: false, ecrire: false, supprimer: false },
        machines:             { lire: false, ecrire: false, supprimer: false },
        'matieres-premieres': { lire: false, ecrire: false, supprimer: false },
        logistique:           { lire: true,  ecrire: true,  supprimer: false },
        bom:                  { lire: true,  ecrire: false, supprimer: false },
      },
    },
    {
      code: 'production',
      nom: 'Production',
      description: 'Production, Machines, Matières premières, BOM, Stock',
      permissions: {
        crm:                  { lire: true,  ecrire: false, supprimer: false },
        commandes:            { lire: true,  ecrire: true,  supprimer: false },
        production:           { lire: true,  ecrire: true,  supprimer: false },
        stock:                { lire: true,  ecrire: true,  supprimer: false },
        facturation:          { lire: false, ecrire: false, supprimer: false },
        recyclage:            { lire: true,  ecrire: true,  supprimer: false },
        reporting:            { lire: false, ecrire: false, supprimer: false },
        fournisseurs:         { lire: true,  ecrire: false, supprimer: false },
        machines:             { lire: true,  ecrire: true,  supprimer: false },
        'matieres-premieres': { lire: true,  ecrire: true,  supprimer: false },
        logistique:           { lire: true,  ecrire: false, supprimer: false },
        bom:                  { lire: true,  ecrire: true,  supprimer: false },
      },
    },
    {
      code: 'magasinier',
      nom: 'Magasinier',
      description: 'Stock, Matières premières, Fournisseurs, Logistique',
      permissions: {
        crm:                  { lire: false, ecrire: false, supprimer: false },
        commandes:            { lire: true,  ecrire: false, supprimer: false },
        production:           { lire: true,  ecrire: false, supprimer: false },
        stock:                { lire: true,  ecrire: true,  supprimer: false },
        facturation:          { lire: false, ecrire: false, supprimer: false },
        recyclage:            { lire: true,  ecrire: true,  supprimer: false },
        reporting:            { lire: false, ecrire: false, supprimer: false },
        fournisseurs:         { lire: true,  ecrire: true,  supprimer: false },
        machines:             { lire: true,  ecrire: false, supprimer: false },
        'matieres-premieres': { lire: true,  ecrire: true,  supprimer: true  },
        logistique:           { lire: true,  ecrire: true,  supprimer: false },
        bom:                  { lire: true,  ecrire: false, supprimer: false },
      },
    },
    {
      code: 'comptable',
      nom: 'Comptable',
      description: 'Facturation complète, reporting financier, commandes (lecture)',
      permissions: {
        crm:                  { lire: true,  ecrire: false, supprimer: false },
        commandes:            { lire: true,  ecrire: false, supprimer: false },
        production:           { lire: false, ecrire: false, supprimer: false },
        stock:                { lire: false, ecrire: false, supprimer: false },
        facturation:          { lire: true,  ecrire: true,  supprimer: false },
        recyclage:            { lire: false, ecrire: false, supprimer: false },
        reporting:            { lire: true,  ecrire: false, supprimer: false },
        fournisseurs:         { lire: true,  ecrire: false, supprimer: false },
        machines:             { lire: false, ecrire: false, supprimer: false },
        'matieres-premieres': { lire: false, ecrire: false, supprimer: false },
        logistique:           { lire: true,  ecrire: false, supprimer: false },
        bom:                  { lire: false, ecrire: false, supprimer: false },
      },
    },
  ];

  for (const g of groupesData) {
    await (prisma as any).groupe.upsert({
      where: { tenantId_code: { tenantId: gisac.id, code: g.code } },
      update: { nom: g.nom, description: g.description, permissions: g.permissions },
      create: { tenantId: gisac.id, ...g },
    });
  }

  // ─── 9. Produits GISAC ──────────────────────────────────────────────────────
  console.log('Création des produits...');
  const produitsData = [
    { reference: 'FILM-PE-100', nom: 'Film PE 100 microns', categorie: 'film_plastique', unite: 'rouleau', prixUnitaire: 45000 },
    { reference: 'FILM-PE-200', nom: 'Film PE 200 microns', categorie: 'film_plastique', unite: 'rouleau', prixUnitaire: 72000 },
    { reference: 'BACHE-AGR-50', nom: 'Bâche Agricole Noir 50μ', categorie: 'bache_agricole', unite: 'rouleau', prixUnitaire: 38000 },
    { reference: 'BACHE-AGR-80', nom: 'Bâche Agricole Noir 80μ', categorie: 'bache_agricole', unite: 'rouleau', prixUnitaire: 55000 },
    { reference: 'EMB-ALI-500', nom: 'Emballage Alimentaire 500g', categorie: 'emb_alimentaire', unite: 'kg', prixUnitaire: 2800 },
    { reference: 'EMB-IND-001', nom: 'Emballage Industriel LDPE', categorie: 'emballage', unite: 'kg', prixUnitaire: 2200 },
    { reference: 'REC-GRA-001', nom: 'Granulés Recyclés PE', categorie: 'recycle', unite: 'kg', prixUnitaire: 850 },
    { reference: 'FILM-STR-01', nom: 'Film Étirable Manuel', categorie: 'film_plastique', unite: 'rouleau', prixUnitaire: 12000 },
  ];
  const produitsMap: Record<string, string> = {};
  for (const p of produitsData) {
    const created = await prisma.produit.upsert({
      where: { tenantId_reference: { tenantId: gisac.id, reference: p.reference } },
      update: { nom: p.nom, prixUnitaire: p.prixUnitaire },
      create: { tenantId: gisac.id, ...p },
    });
    produitsMap[p.reference] = created.id;
  }

  // ─── 9. Clients GISAC ───────────────────────────────────────────────────────
  console.log('Création des clients...');
  const clientsData = [
    { reference: 'CLI-001', nom: 'SEDIMA SA', type: 'industriel', ville: 'Thiès', telephone: '+221 33 951 00 00' },
    { reference: 'CLI-002', nom: 'Grands Moulins de Dakar', type: 'alimentaire', ville: 'Dakar', telephone: '+221 33 839 57 00' },
    { reference: 'CLI-003', nom: 'SOMISEN', type: 'industriel', ville: 'Thiès', telephone: '+221 33 952 11 00' },
    { reference: 'CLI-004', nom: 'Coop. Horticole Thiès', type: 'agricole', ville: 'Thiès', telephone: '+221 77 450 00 00' },
    { reference: 'CLI-005', nom: 'BIS Distribution', type: 'distributeur', ville: 'Dakar', telephone: '+221 33 821 00 00' },
  ];
  const clientsMap: Record<string, string> = {};
  for (const c of clientsData) {
    const created = await prisma.client.upsert({
      where: { tenantId_reference: { tenantId: gisac.id, reference: c.reference } },
      update: { nom: c.nom },
      create: { tenantId: gisac.id, ...c, statut: 'actif' },
    });
    clientsMap[c.reference] = created.id;
  }

  // ─── 10. Fournisseurs GISAC ─────────────────────────────────────────────────
  console.log('Création des fournisseurs...');
  const fourData = [
    { reference: 'FOUR-001', nom: 'Resin Africa Ltd', pays: 'GH' },
    { reference: 'FOUR-002', nom: 'Plastiques du Maghreb', pays: 'MA' },
    { reference: 'FOUR-003', nom: 'Colorants Industriels SN', pays: 'SN' },
  ];
  const fournisseursMap: Record<string, string> = {};
  for (const f of fourData) {
    const created = await prisma.fournisseur.upsert({
      where: { tenantId_reference: { tenantId: gisac.id, reference: f.reference } },
      update: { nom: f.nom },
      create: { tenantId: gisac.id, ...f },
    });
    fournisseursMap[f.reference] = created.id;
  }

  // ─── 11. Matières premières GISAC ───────────────────────────────────────────
  console.log('Création des matières premières...');
  const mpData = [
    { reference: 'MP-PE-HD', nom: 'Polyéthylène Haute Densité', type: 'granule_pe', prixAchat: 950, stockActuel: 2500, stockMinimum: 500, fournisseur: 'FOUR-001' },
    { reference: 'MP-PE-BD', nom: 'Polyéthylène Basse Densité', type: 'granule_pe', prixAchat: 880, stockActuel: 1800, stockMinimum: 400, fournisseur: 'FOUR-001' },
    { reference: 'MP-PP-001', nom: 'Polypropylène Standard', type: 'granule_pp', prixAchat: 1100, stockActuel: 800, stockMinimum: 300, fournisseur: 'FOUR-002' },
    { reference: 'MP-COL-NR', nom: 'Masterbatch Noir', type: 'colorant', prixAchat: 2800, stockActuel: 320, stockMinimum: 100, fournisseur: 'FOUR-003' },
    { reference: 'MP-COL-BL', nom: 'Masterbatch Bleu', type: 'colorant', prixAchat: 3200, stockActuel: 180, stockMinimum: 50, fournisseur: 'FOUR-003' },
    { reference: 'MP-REC-01', nom: 'Granulés Recyclés PE', type: 'granule_pe', prixAchat: 420, stockActuel: 650, stockMinimum: 200, isRecycle: true, fournisseur: null },
  ];
  const mpMap: Record<string, string> = {};
  for (const mp of mpData) {
    const created = await prisma.matierePremiere.upsert({
      where: { tenantId_reference: { tenantId: gisac.id, reference: mp.reference } },
      update: { stockActuel: mp.stockActuel, prixAchat: mp.prixAchat },
      create: {
        tenantId: gisac.id,
        reference: mp.reference,
        nom: mp.nom,
        type: mp.type,
        prixAchat: mp.prixAchat,
        stockActuel: mp.stockActuel,
        stockMinimum: mp.stockMinimum,
        isRecycle: mp.isRecycle ?? false,
        fournisseurId: mp.fournisseur ? fournisseursMap[mp.fournisseur] : null,
      },
    });
    mpMap[mp.reference] = created.id;
  }

  // ─── 12. Machines GISAC ─────────────────────────────────────────────────────
  console.log('Création des machines...');
  const machinesData = [
    { code: 'EXT-001', nom: 'Extrudeuse Blown Film 1', type: 'soufflage', statut: 'en_production', capacite: 120 },
    { code: 'EXT-002', nom: 'Extrudeuse Blown Film 2', type: 'soufflage', statut: 'disponible', capacite: 150 },
    { code: 'REC-001', nom: 'Ligne de Recyclage', type: 'recyclage', statut: 'disponible', capacite: 80 },
    { code: 'IMP-001', nom: 'Imprimeuse Flexo', type: 'impression', statut: 'maintenance', capacite: null },
  ];
  const machinesMap: Record<string, string> = {};
  for (const m of machinesData) {
    const created = await prisma.machine.upsert({
      where: { tenantId_code: { tenantId: gisac.id, code: m.code } },
      update: { statut: m.statut },
      create: { tenantId: gisac.id, code: m.code, nom: m.nom, type: m.type, statut: m.statut, capacite: m.capacite },
    });
    machinesMap[m.code] = created.id;
  }

  // ─── 13. Commandes GISAC ────────────────────────────────────────────────────
  console.log('Création des commandes...');
  const admin = await prisma.user.findFirst({ where: { tenantId: gisac.id, role: 'admin' } });
  const adminId = admin!.id;

  const commandesData = [
    {
      reference: 'CMD-2026-0001',
      clientId: clientsMap['CLI-001'],
      statut: 'livree',
      totalHT: 2250000,
      tva: 405000,
      totalTTC: 2655000,
      lignes: [
        { produitId: produitsMap['FILM-PE-100'], quantite: 30, prixUnitaire: 45000, montant: 1350000 },
        { produitId: produitsMap['BACHE-AGR-50'], quantite: 24, prixUnitaire: 38000, montant: 912000 },
      ],
    },
    {
      reference: 'CMD-2026-0002',
      clientId: clientsMap['CLI-002'],
      statut: 'confirmee',
      totalHT: 1680000,
      tva: 302400,
      totalTTC: 1982400,
      lignes: [
        { produitId: produitsMap['EMB-ALI-500'], quantite: 300, prixUnitaire: 2800, montant: 840000 },
        { produitId: produitsMap['EMB-IND-001'], quantite: 400, prixUnitaire: 2100, montant: 840000 },
      ],
    },
    {
      reference: 'CMD-2026-0003',
      clientId: clientsMap['CLI-005'],
      statut: 'brouillon',
      totalHT: 900000,
      tva: 162000,
      totalTTC: 1062000,
      lignes: [
        { produitId: produitsMap['FILM-STR-01'], quantite: 75, prixUnitaire: 12000, montant: 900000 },
      ],
    },
  ];

  const commandesMap: Record<string, string> = {};
  for (const cmd of commandesData) {
    const existing = await prisma.commande.findFirst({ where: { tenantId: gisac.id, reference: cmd.reference } });
    if (!existing) {
      const created = await prisma.commande.create({
        data: {
          tenantId: gisac.id,
          reference: cmd.reference,
          clientId: cmd.clientId,
          statut: cmd.statut,
          totalHT: cmd.totalHT,
          tva: cmd.tva,
          totalTTC: cmd.totalTTC,
          lignes: { create: cmd.lignes },
        },
      });
      await prisma.commandeHistorique.create({
        data: { commandeId: created.id, tenantId: gisac.id, userId: adminId, nouveauStatut: cmd.statut, commentaire: 'Seed initial' },
      });
      commandesMap[cmd.reference] = created.id;
    } else {
      commandesMap[cmd.reference] = existing.id;
    }
  }

  // ─── 13b. Nomenclatures BOM GISAC ───────────────────────────────────────────
  console.log('Création des BOMs...');
  const bomsData = [
    {
      nom: 'BOM Film PE 100µ v1',
      produitFiniId: produitsMap['FILM-PE-100'],
      version: '1.0',
      items: [
        { matiereRef: 'MP-PE-BD', quantite: 1.05, unite: 'kg', pertes: 5 },
        { matiereRef: 'MP-COL-BL', quantite: 0.02, unite: 'kg', pertes: 2 },
      ],
    },
    {
      nom: 'BOM Emballage Alimentaire 500g v1',
      produitFiniId: produitsMap['EMB-ALI-500'],
      version: '1.0',
      items: [
        { matiereRef: 'MP-PE-HD', quantite: 0.55, unite: 'kg', pertes: 3 },
        { matiereRef: 'MP-COL-NR', quantite: 0.01, unite: 'kg', pertes: 2 },
      ],
    },
    {
      nom: 'BOM Bâche Agricole Noir 50µ v1',
      produitFiniId: produitsMap['BACHE-AGR-50'],
      version: '1.0',
      items: [
        { matiereRef: 'MP-PP-001', quantite: 1.1, unite: 'kg', pertes: 4 },
        { matiereRef: 'MP-COL-NR', quantite: 0.02, unite: 'kg', pertes: 2 },
      ],
    },
  ];

  // Récupérer les IDs des MP par référence
  const bomMpRefs = [...new Set(bomsData.flatMap((b) => b.items.map((i) => i.matiereRef)))];
  const bomMpRecords = await prisma.matierePremiere.findMany({
    where: { tenantId: gisac.id, reference: { in: bomMpRefs } },
    select: { id: true, reference: true },
  });
  const bomMpMap: Record<string, string> = {};
  for (const mp of bomMpRecords) bomMpMap[mp.reference] = mp.id;

  for (const bomData of bomsData) {
    if (!bomData.produitFiniId) continue;
    const existing = await prisma.bom.findFirst({
      where: { tenantId: gisac.id, produitFiniId: bomData.produitFiniId, version: bomData.version },
    });
    if (!existing) {
      const bom = await prisma.bom.create({
        data: { tenantId: gisac.id, nom: bomData.nom, produitFiniId: bomData.produitFiniId, version: bomData.version, actif: true },
      });
      await prisma.bomItem.createMany({
        data: bomData.items
          .filter((i) => bomMpMap[i.matiereRef])
          .map((i) => ({ bomId: bom.id, matierePremiereId: bomMpMap[i.matiereRef], quantite: i.quantite, unite: i.unite, pertes: i.pertes })),
      });
    }
  }

  // ─── 14. Ordres de fabrication GISAC ────────────────────────────────────────
  console.log('Création des OFs...');
  const ofsData = [
    {
      reference: 'OF-2026-0001',
      commandeId: commandesMap['CMD-2026-0001'],
      produitId: produitsMap['FILM-PE-100'],
      produitFini: 'Film PE 100 microns',
      quantitePrevue: 30,
      statut: 'termine',
      machineId: machinesMap['EXT-001'],
    },
    {
      reference: 'OF-2026-0002',
      commandeId: commandesMap['CMD-2026-0002'],
      produitId: produitsMap['EMB-ALI-500'],
      produitFini: 'Emballage Alimentaire 500g',
      quantitePrevue: 300,
      statut: 'en_cours',
      machineId: machinesMap['EXT-002'],
    },
  ];

  for (const of_ of ofsData) {
    const existing = await prisma.ordreFabrication.findFirst({ where: { tenantId: gisac.id, reference: of_.reference } });
    if (!existing) {
      await prisma.ordreFabrication.create({ data: { tenantId: gisac.id, ...of_ } });
    }
  }

  // ─── 15. Collectes recyclage GISAC ──────────────────────────────────────────
  console.log('Création des collectes recyclage...');
  const collectesCount = await prisma.recyclageCollecte.count({ where: { tenantId: gisac.id } });
  if (collectesCount === 0) {
    await prisma.recyclageCollecte.createMany({
      data: [
        { tenantId: gisac.id, typeDechet: 'plastique_pe', quantite: 850, unite: 'kg', collecteur: 'Collecte interne', statut: 'traite' },
        { tenantId: gisac.id, typeDechet: 'plastique_pp', quantite: 320, unite: 'kg', collecteur: 'SONAGED', statut: 'collecte' },
        { tenantId: gisac.id, typeDechet: 'chutes_film', quantite: 180, unite: 'kg', collecteur: 'Collecte interne', statut: 'en_traitement' },
      ],
    });
  }

  // ─── 16. Tenant AgriTech Dakar ──────────────────────────────────────────────
  console.log('Création du tenant AgriTech Dakar...');
  const agriTech = await prisma.tenant.upsert({
    where: { slug: 'agritech-dakar' },
    update: {},
    create: {
      slug: 'agritech-dakar',
      nom: 'AgriTech Dakar SARL',
      secteur: 'agro-alimentaire',
      plan: 'starter',
      couleurPrimaire: '#2E7D32',
      couleurSecondaire: '#FFA000',
      telephone: '77 456 78 90',
      adresse: 'Zone Franche, Diamniadio',
      ville: 'Dakar',
      pays: 'SN',
    },
  });

  const agriPwHash = await bcrypt.hash('Admin2025!', 12);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: agriTech.id, email: 'admin@agritech-dakar.sn' } },
    update: {},
    create: {
      tenantId: agriTech.id,
      nom: 'Diop',
      prenom: 'Alioune',
      email: 'admin@agritech-dakar.sn',
      passwordHash: agriPwHash,
      role: 'admin',
      actif: true,
    },
  });

  // Modules AgriTech (plan starter : CRM, commandes, stock, facturation)
  for (const code of ['crm', 'commandes', 'stock', 'facturation']) {
    if (modulesMap[code]) {
      await prisma.tenantModule.upsert({
        where: { tenantId_moduleId: { tenantId: agriTech.id, moduleId: modulesMap[code] } },
        update: { actif: true },
        create: { tenantId: agriTech.id, moduleId: modulesMap[code], actif: true },
      });
    }
  }

  // Clients AgriTech
  const agriClientsData = [
    { reference: 'AGR-CLI-001', nom: 'Grands Moulins de Dakar', type: 'entreprise', ville: 'Dakar', telephone: '33 820 00 00' },
    { reference: 'AGR-CLI-002', nom: 'Coopérative Agricole Casamance', type: 'cooperative', ville: 'Ziguinchor', telephone: '77 334 56 78' },
    { reference: 'AGR-CLI-003', nom: 'Export Sénégal Foods', type: 'entreprise', ville: 'Dakar', email: 'contact@esfoods.sn' },
  ];
  const agriClientsMap: Record<string, string> = {};
  for (const c of agriClientsData) {
    const existing = await prisma.client.findFirst({ where: { tenantId: agriTech.id, reference: c.reference } });
    if (!existing) {
      const created = await prisma.client.create({ data: { ...c, tenantId: agriTech.id } });
      agriClientsMap[c.reference] = created.id;
    } else {
      agriClientsMap[c.reference] = existing.id;
    }
  }

  // Produits AgriTech
  const agriProduitsData = [
    { reference: 'AGR-PRD-001', nom: 'Sac kraft 25kg', categorie: 'emballage', prixUnitaire: 850, unite: 'pce' },
    { reference: 'AGR-PRD-002', nom: 'Filet de protection récolte', categorie: 'protection', prixUnitaire: 12500, unite: 'pce' },
    { reference: 'AGR-PRD-003', nom: 'Bac de stockage 50L', categorie: 'stockage', prixUnitaire: 7500, unite: 'pce' },
  ];
  const agriProduitsMap: Record<string, string> = {};
  for (const p of agriProduitsData) {
    const existing = await prisma.produit.findFirst({ where: { tenantId: agriTech.id, reference: p.reference } });
    if (!existing) {
      const created = await prisma.produit.create({ data: { ...p, tenantId: agriTech.id } });
      agriProduitsMap[p.reference] = created.id;
    } else {
      agriProduitsMap[p.reference] = existing.id;
    }
  }

  // Commande AgriTech (isolation tenant — invisible depuis GISAC)
  const agriCmdExisting = await prisma.commande.findFirst({
    where: { tenantId: agriTech.id, reference: 'AGR-CMD-2026-0001' },
  });
  if (!agriCmdExisting && agriClientsMap['AGR-CLI-001'] && agriProduitsMap['AGR-PRD-001']) {
    const agriAdminUser = await prisma.user.findFirst({ where: { tenantId: agriTech.id } });
    if (agriAdminUser) {
      await prisma.commande.create({
        data: {
          tenantId: agriTech.id,
          reference: 'AGR-CMD-2026-0001',
          clientId: agriClientsMap['AGR-CLI-001'],
          statut: 'confirmee',
          totalHT: 425000,
          tva: 76500,
          totalTTC: 501500,
          lignes: {
            create: [
              { produitId: agriProduitsMap['AGR-PRD-001'], quantite: 500, prixUnitaire: 850, montant: 425000 },
            ],
          },
        },
      });
    }
  }

  console.log('✅ Seed terminé avec succès !');
  console.log('');
  console.log('Comptes GISAC créés :');
  console.log('  admin@gisac.sn / Admin2025!');
  console.log('  direction@gisac.sn / Direction2025!');
  console.log('  commercial@gisac.sn / Commercial2025!');
  console.log('  production@gisac.sn / Prod2025!');
  console.log('  magasinier@gisac.sn / Stock2025!');
  console.log('  comptable@gisac.sn / Compta2025!');
  console.log('');
  console.log('Compte AgriTech Dakar :');
  console.log('  admin@agritech-dakar.sn / Admin2025!  →  http://localhost:3000/agritech-dakar');
}

main()
  .catch((e) => {
    console.error('Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
