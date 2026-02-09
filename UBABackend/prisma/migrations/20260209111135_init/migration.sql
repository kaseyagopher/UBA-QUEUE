/*
  Warnings:

  - You are about to drop the column `password` on the `utilisateur` table. All the data in the column will be lost.
  - Added the required column `motDePasse` to the `utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `utilisateur` DROP COLUMN `password`,
    ADD COLUMN `motDePasse` VARCHAR(255) NOT NULL;
