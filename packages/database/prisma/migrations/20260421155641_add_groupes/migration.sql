-- AlterTable
ALTER TABLE "fournisseurs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "machines" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "matieres_premieres" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "produits" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "groupes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groupes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "groupes_tenant_id_code_key" ON "groupes"("tenant_id", "code");

-- AddForeignKey
ALTER TABLE "groupes" ADD CONSTRAINT "groupes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
