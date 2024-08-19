/*
  Warnings:

  - A unique constraint covering the columns `[license_plate]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Vehicle_license_plate_key` ON `Vehicle`(`license_plate`);
