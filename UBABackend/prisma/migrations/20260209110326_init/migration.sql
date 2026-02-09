/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `utilisateur` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `utilisateur` ADD COLUMN `email` VARCHAR(255) NOT NULL,
    ADD COLUMN `password` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `utilisateur_email_key` ON `utilisateur`(`email`);
