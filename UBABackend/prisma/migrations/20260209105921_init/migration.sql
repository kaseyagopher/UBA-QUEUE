/*
  Warnings:

  - Added the required column `role` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statut` to the `utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `utilisateur` ADD COLUMN `role` VARCHAR(50) NOT NULL,
    ADD COLUMN `statut` VARCHAR(50) NOT NULL;
