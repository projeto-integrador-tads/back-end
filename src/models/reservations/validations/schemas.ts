import { z } from "zod";

export const reservationIdSchema = z.object({
  ride_id: z.string().uuid(),
});

export const createReservationSchema = z.object({
  ride_id: z.string().uuid(),
});

export const cancelReservationSchema = z.object({
  reservation_id: z.string().uuid(),
});

export const confirmReservationSchema = z.object({
  reservation_id: z.string().uuid(),
});
