/*
  Warnings:

  - Added the required column `email` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motDePasse` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postnom` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statut` to the `utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `utilisateur` ADD COLUMN `email` VARCHAR(100) NOT NULL,
    ADD COLUMN `idService` INTEGER NULL,
    ADD COLUMN `motDePasse` VARCHAR(255) NOT NULL,
    ADD COLUMN `nom` VARCHAR(100) NOT NULL,
    ADD COLUMN `postnom` VARCHAR(100) NOT NULL,
    ADD COLUMN `prenom` VARCHAR(100) NOT NULL,
    ADD COLUMN `role` VARCHAR(50) NOT NULL,
    ADD COLUMN `statut` VARCHAR(50) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
