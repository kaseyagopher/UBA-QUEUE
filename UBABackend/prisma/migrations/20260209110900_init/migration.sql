-- AlterTable
ALTER TABLE `utilisateur` ADD COLUMN `idService` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `utilisateur` ADD CONSTRAINT `utilisateur_idService_fkey` FOREIGN KEY (`idService`) REFERENCES `service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
