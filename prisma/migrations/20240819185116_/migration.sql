/*
  Warnings:

  - A unique constraint covering the columns `[passenger_id]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Reservation_passenger_id_key` ON `Reservation`(`passenger_id`);
