/*
  Warnings:

  - Changed the type of `species` on the `Pet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PetSpecies" AS ENUM ('DOG', 'CAT');

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "species",
ADD COLUMN     "species" "PetSpecies" NOT NULL;
