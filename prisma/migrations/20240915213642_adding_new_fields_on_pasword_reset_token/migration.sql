/*
  Warnings:

  - You are about to drop the column `token` on the `passwordresettoken` table. All the data in the column will be lost.
  - Added the required column `lastEmailSentAt` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resetCode` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `passwordresettoken` DROP COLUMN `token`,
    ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lastEmailSentAt` DATETIME(3) NOT NULL,
    ADD COLUMN `resetCode` VARCHAR(191) NOT NULL;
