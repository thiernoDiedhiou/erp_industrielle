-- AlterTable
ALTER TABLE "recyclage_collectes" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "matiere_premiere_cible_id" TEXT;

-- AddForeignKey
ALTER TABLE "recyclage_collectes" ADD CONSTRAINT "recyclage_collectes_matiere_premiere_cible_id_fkey" FOREIGN KEY ("matiere_premiere_cible_id") REFERENCES "matieres_premieres"("id") ON DELETE SET NULL ON UPDATE CASCADE;
