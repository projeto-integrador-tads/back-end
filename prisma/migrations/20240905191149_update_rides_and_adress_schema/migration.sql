/*
  Warnings:

  - You are about to drop the column `end_location` on the `ride` table. All the data in the column will be lost.
  - You are about to drop the column `start_location` on the `ride` table. All the data in the column will be lost.
  - You are about to drop the column `address_id` on the `user` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_address_id` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_address_id` to the `Ride` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_address_id_fkey`;

-- AlterTable
ALTER TABLE `address` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ride` DROP COLUMN `end_location`,
    DROP COLUMN `start_location`,
    ADD COLUMN `end_address_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `start_address_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `address_id`;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ride` ADD CONSTRAINT `Ride_start_address_id_fkey` FOREIGN KEY (`start_address_id`) REFERENCES `Address`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ride` ADD CONSTRAINT `Ride_end_address_id_fkey` FOREIGN KEY (`end_address_id`) REFERENCES `Address`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
