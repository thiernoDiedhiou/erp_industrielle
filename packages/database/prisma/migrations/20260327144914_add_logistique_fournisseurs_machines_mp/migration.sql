-- CreateTable
CREATE TABLE "bons_livraison" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "numero_bl" TEXT NOT NULL,
    "commande_id" TEXT,
    "client_id" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'prepare',
    "adresse_livraison" TEXT,
    "transporteur" TEXT,
    "date_expedition" TIMESTAMP(3),
    "date_livraison_reelle" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bons_livraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_livraison" (
    "id" TEXT NOT NULL,
    "bon_livraison_id" TEXT NOT NULL,
    "produit_id" TEXT NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "lignes_livraison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bons_livraison_tenant_id_statut_idx" ON "bons_livraison"("tenant_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "bons_livraison_tenant_id_numero_bl_key" ON "bons_livraison"("tenant_id", "numero_bl");

-- AddForeignKey
ALTER TABLE "bons_livraison" ADD CONSTRAINT "bons_livraison_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bons_livraison" ADD CONSTRAINT "bons_livraison_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_livraison" ADD CONSTRAINT "lignes_livraison_bon_livraison_id_fkey" FOREIGN KEY ("bon_livraison_id") REFERENCES "bons_livraison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_livraison" ADD CONSTRAINT "lignes_livraison_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
