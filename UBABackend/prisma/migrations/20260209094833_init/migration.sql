/*
  Warnings:

  - You are about to drop the column `email` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `idService` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `motDePasse` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `utilisateur` DROP COLUMN `email`,
    DROP COLUMN `idService`,
    DROP COLUMN `motDePasse`,
    DROP COLUMN `role`,
    DROP COLUMN `statut`;

-- CreateTable
CREATE TABLE `service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomService` VARCHAR(50) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `postnom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` INTEGER NOT NULL,
    `statut` VARCHAR(50) NOT NULL,
    `heureArrivee` DATETIME(3) NOT NULL,
    `heureServi` DATETIME(3) NULL,
    `idService` INTEGER NULL,
    `idClient` INTEGER NULL,
    `idUtilisateur` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_idService_fkey` FOREIGN KEY (`idService`) REFERENCES `service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_idClient_fkey` FOREIGN KEY (`idClient`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket` ADD CONSTRAINT `ticket_idUtilisateur_fkey` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
