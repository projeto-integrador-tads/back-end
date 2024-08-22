import { FastifyInstance } from "fastify";
import { createReservationSchema } from "../../utils/schemas";
import { createReservation } from "../../models/reservations/createReservation";

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
}
