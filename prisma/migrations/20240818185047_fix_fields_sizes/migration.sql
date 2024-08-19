/*
  Warnings:

  - You are about to alter the column `preferences` on the `ride` table. The data in that column could be lost. The data in that column will be cast from `VarChar(300)` to `VarChar(191)`.
  - You are about to alter the column `brand` on the `vehicle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to alter the column `model` on the `vehicle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to alter the column `license_plate` on the `vehicle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(7)`.
  - You are about to alter the column `color` on the `vehicle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(30)`.
  - You are about to alter the column `document` on the `vehicle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `ride` MODIFY `preferences` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `vehicle` MODIFY `brand` VARCHAR(50) NOT NULL,
    MODIFY `model` VARCHAR(50) NOT NULL,
    ALTER COLUMN `year` DROP DEFAULT,
    MODIFY `license_plate` VARCHAR(7) NOT NULL,
    MODIFY `color` VARCHAR(30) NOT NULL,
    MODIFY `document` VARCHAR(191) NOT NULL;
