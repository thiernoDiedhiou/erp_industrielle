-- DropForeignKey
ALTER TABLE "boms" DROP CONSTRAINT "boms_produit_fini_id_fkey";

-- AddForeignKey
ALTER TABLE "boms" ADD CONSTRAINT "boms_produit_fini_id_fkey" FOREIGN KEY ("produit_fini_id") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
