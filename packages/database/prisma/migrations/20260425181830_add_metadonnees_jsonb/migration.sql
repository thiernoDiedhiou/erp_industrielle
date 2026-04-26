-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "metadonnees" JSONB;

-- AlterTable
ALTER TABLE "commandes" ADD COLUMN     "metadonnees" JSONB;

-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "metadonnees" JSONB;

-- AlterTable
ALTER TABLE "produits" ADD COLUMN     "metadonnees" JSONB;
