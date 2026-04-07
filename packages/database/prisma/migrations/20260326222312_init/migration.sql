-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "secteur" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "logo_url" TEXT,
    "couleur_primaire" TEXT,
    "couleur_secondaire" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "pays" TEXT NOT NULL DEFAULT 'SN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_modules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "label" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_fields" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_values" (
    "id" TEXT NOT NULL,
    "custom_field_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "custom_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_enums" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "custom_enums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_states" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "is_initial" BOOLEAN NOT NULL DEFAULT false,
    "is_final" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "workflow_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_transitions" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "from_state_id" TEXT NOT NULL,
    "to_state_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "roles_allowed" TEXT[],
    "needs_approval" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workflow_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "refresh_token_hash" TEXT,
    "role" TEXT NOT NULL,
    "telephone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nom_entreprise" TEXT NOT NULL,
    "code_client" TEXT NOT NULL,
    "type_client" TEXT NOT NULL DEFAULT 'entreprise',
    "ninea" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'actif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code_produit" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "unite_mesure" TEXT NOT NULL DEFAULT 'pce',
    "prix_vente_ht" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description_technique" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "numero_commande" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'brouillon',
    "date_livraison_souhaitee" TIMESTAMP(3),
    "montant_ht" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tva" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "montant_ttc" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commande" (
    "id" TEXT NOT NULL,
    "commande_id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL,
    "prix_unitaire_ht" DECIMAL(15,2) NOT NULL,
    "montant_ligne_ht" DECIMAL(15,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "lignes_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commande_historique" (
    "id" TEXT NOT NULL,
    "commande_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "from_statut" TEXT,
    "to_statut" TEXT NOT NULL,
    "commentaire" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commande_historique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code_fournisseur" TEXT NOT NULL,
    "nom_entreprise" TEXT NOT NULL,
    "pays" TEXT NOT NULL DEFAULT 'SN',
    "email" TEXT,
    "telephone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matieres_premieres" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code_mp" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "type_mp" TEXT NOT NULL,
    "fournisseur_id" TEXT,
    "unite_mesure" TEXT NOT NULL DEFAULT 'kg',
    "prix_achat_unitaire" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "stock_actuel" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock_minimum" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_recycle" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matieres_premieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom_machine" TEXT NOT NULL,
    "type_machine" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'disponible',
    "capacite_production" DECIMAL(10,2),
    "unite" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordres_fabrication" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "numero_of" TEXT NOT NULL,
    "commande_id" TEXT,
    "produit_id" TEXT NOT NULL,
    "produit_fini" TEXT NOT NULL,
    "quantite_prevue" DECIMAL(10,2) NOT NULL,
    "quantite_produite" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'planifie',
    "machine_id" TEXT,
    "date_debut_reelle" TIMESTAMP(3),
    "date_fin_reelle" TIMESTAMP(3),
    "notes_production" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordres_fabrication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consommations_mp" (
    "id" TEXT NOT NULL,
    "of_id" TEXT NOT NULL,
    "matiere_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "quantite_reelle" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "consommations_mp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type_mouvement" TEXT NOT NULL,
    "reference_document" TEXT NOT NULL,
    "matiere_id" TEXT,
    "fournisseur_id" TEXT,
    "quantite" DECIMAL(10,2) NOT NULL,
    "motif" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "numero_facture" TEXT NOT NULL,
    "commande_id" TEXT NOT NULL,
    "statut_paiement" TEXT NOT NULL DEFAULT 'emise',
    "montant_ht" DECIMAL(15,2) NOT NULL,
    "montant_tva" DECIMAL(15,2) NOT NULL,
    "montant_ttc" DECIMAL(15,2) NOT NULL,
    "date_echeance" TIMESTAMP(3) NOT NULL,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "facture_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "mode_paiement" TEXT NOT NULL,
    "reference_transaction" TEXT,
    "notes" TEXT,
    "date_paiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recyclage_collectes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type_dechet" TEXT NOT NULL,
    "quantite_kg" DECIMAL(10,2) NOT NULL,
    "unite" TEXT NOT NULL DEFAULT 'kg',
    "source" TEXT,
    "collecteur" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'collecte',
    "notes" TEXT,
    "date_collecte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recyclage_collectes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "modules_code_key" ON "modules"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_modules_tenant_id_module_id_key" ON "tenant_modules"("tenant_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_tenant_id_key_unique" ON "settings"("tenant_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "custom_fields_tenant_id_entity_code_key" ON "custom_fields"("tenant_id", "entity", "code");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_values_field_entity_unique" ON "custom_field_values"("custom_field_id", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_enums_tenant_id_entity_value_key" ON "custom_enums"("tenant_id", "entity", "value");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_states_workflow_id_code_key" ON "workflow_states"("workflow_id", "code");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "clients_tenant_id_idx" ON "clients"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_tenant_id_code_client_key" ON "clients"("tenant_id", "code_client");

-- CreateIndex
CREATE INDEX "produits_tenant_id_idx" ON "produits"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "produits_tenant_id_code_produit_key" ON "produits"("tenant_id", "code_produit");

-- CreateIndex
CREATE INDEX "commandes_tenant_id_statut_idx" ON "commandes"("tenant_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_tenant_id_numero_commande_key" ON "commandes"("tenant_id", "numero_commande");

-- CreateIndex
CREATE UNIQUE INDEX "fournisseurs_tenant_id_code_fournisseur_key" ON "fournisseurs"("tenant_id", "code_fournisseur");

-- CreateIndex
CREATE INDEX "matieres_premieres_tenant_id_idx" ON "matieres_premieres"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "matieres_premieres_tenant_id_code_mp_key" ON "matieres_premieres"("tenant_id", "code_mp");

-- CreateIndex
CREATE INDEX "machines_tenant_id_idx" ON "machines"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "machines_tenant_id_code_key" ON "machines"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "ordres_fabrication_tenant_id_statut_idx" ON "ordres_fabrication"("tenant_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "ordres_fabrication_tenant_id_numero_of_key" ON "ordres_fabrication"("tenant_id", "numero_of");

-- CreateIndex
CREATE INDEX "mouvements_stock_tenant_id_idx" ON "mouvements_stock"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "factures_tenant_id_numero_facture_key" ON "factures"("tenant_id", "numero_facture");

-- CreateIndex
CREATE INDEX "recyclage_collectes_tenant_id_idx" ON "recyclage_collectes"("tenant_id");

-- AddForeignKey
ALTER TABLE "tenant_modules" ADD CONSTRAINT "tenant_modules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_modules" ADD CONSTRAINT "tenant_modules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_fields" ADD CONSTRAINT "custom_fields_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_custom_field_id_fkey" FOREIGN KEY ("custom_field_id") REFERENCES "custom_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_enums" ADD CONSTRAINT "custom_enums_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_states" ADD CONSTRAINT "workflow_states_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_from_state_id_fkey" FOREIGN KEY ("from_state_id") REFERENCES "workflow_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_to_state_id_fkey" FOREIGN KEY ("to_state_id") REFERENCES "workflow_states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commande_historique" ADD CONSTRAINT "commande_historique_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matieres_premieres" ADD CONSTRAINT "matieres_premieres_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordres_fabrication" ADD CONSTRAINT "ordres_fabrication_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordres_fabrication" ADD CONSTRAINT "ordres_fabrication_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consommations_mp" ADD CONSTRAINT "consommations_mp_of_id_fkey" FOREIGN KEY ("of_id") REFERENCES "ordres_fabrication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consommations_mp" ADD CONSTRAINT "consommations_mp_matiere_id_fkey" FOREIGN KEY ("matiere_id") REFERENCES "matieres_premieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_matiere_id_fkey" FOREIGN KEY ("matiere_id") REFERENCES "matieres_premieres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
