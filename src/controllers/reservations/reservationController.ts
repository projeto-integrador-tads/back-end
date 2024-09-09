import { FastifyInstance } from "fastify";
import { createReservationSchema } from "../../utils/schemas";
import { createReservation } from "../../models/reservations/createReservation";
import { cancelReservation } from "../../models/reservations/cancelReservation";

export async function reservationController(fastify: FastifyInstance) {
  fastify.post(
    "/reservations",
    {
      schema: {
        body: createReservationSchema,
      },
    },
    createReservation
  );

  fastify.post("/reservations/cancel/:reservation_id", cancelReservation);
}
