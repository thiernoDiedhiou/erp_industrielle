-- AlterTable
ALTER TABLE "mouvements_stock" ADD COLUMN     "produit_id" TEXT;

-- AddForeignKey
ALTER TABLE "ordres_fabrication" ADD CONSTRAINT "ordres_fabrication_commande_id_fkey" FOREIGN KEY ("commande_id") REFERENCES "commandes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_produit_id_fkey" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
