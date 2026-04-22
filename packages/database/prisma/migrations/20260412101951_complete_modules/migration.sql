/*
  Warnings:

  - Added the required column `updated_at` to the `fournisseurs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `machines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `matieres_premieres` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `produits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bons_livraison" ADD COLUMN     "chauffeur" TEXT,
ADD COLUMN     "vehicule" TEXT;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "commercial_id" TEXT,
ADD COLUMN     "contact_principal" TEXT,
ADD COLUMN     "delai_paiement" INTEGER,
ADD COLUMN     "plafond_credit" DECIMAL(15,2);

-- AlterTable
ALTER TABLE "commandes" ADD COLUMN     "adresse_livraison" TEXT,
ADD COLUMN     "commercial_id" TEXT,
ADD COLUMN     "date_livraison_prevue" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "fournisseurs" ADD COLUMN     "conditions_paiement" TEXT,
ADD COLUMN     "contact_principal" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "delai_livraison_moyen" INTEGER,
ADD COLUMN     "note_evaluation" DECIMAL(3,1),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "lignes_commande" ADD COLUMN     "remise_pct" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_derniere_maintenance" TIMESTAMP(3),
ADD COLUMN     "localisation" TEXT,
ADD COLUMN     "prochaine_maintenance_date" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "matieres_premieres" ADD COLUMN     "delai_approvisionnement" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ordres_fabrication" ADD COLUMN     "date_debut_prevue" TIMESTAMP(3),
ADD COLUMN     "date_fin_prevue" TIMESTAMP(3),
ADD COLUMN     "quantite_rebut" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "produits" ADD COLUMN     "cout_production" DECIMAL(15,2),
ADD COLUMN     "poids_unite" DECIMAL(10,3),
ADD COLUMN     "stock_actuel" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "stock_min" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "boms" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "produit_fini_id" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_items" (
    "id" TEXT NOT NULL,
    "bom_id" TEXT NOT NULL,
    "matiere_premiere_id" TEXT,
    "produit_id" TEXT,
    "quantite" DECIMAL(10,3) NOT NULL,
    "unite_mesure" TEXT NOT NULL DEFAULT 'kg',
    "taux_pertes_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "bom_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boms_tenant_id_idx" ON "boms"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "boms_tenant_id_produit_fini_id_version_key" ON "boms"("tenant_id", "produit_fini_id", "version");

-- AddForeignKey
ALTER TABLE "boms" ADD CONSTRAINT "boms_produit_fini_id_fkey" FOREIGN KEY ("produit_fini_id") REFERENCES "matieres_premieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_bom_id_fkey" FOREIGN KEY ("bom_id") REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_matiere_premiere_id_fkey" FOREIGN KEY ("matiere_premiere_id") REFERENCES "matieres_premieres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
