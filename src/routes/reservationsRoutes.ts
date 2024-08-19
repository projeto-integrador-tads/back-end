import { FastifyInstance } from "fastify";
import { createReservation } from "../controllers/reservations/reservationController";
import { createReservationSchema } from "../utils/schemas";

export async function reservationRoutes(fastify: FastifyInstance) {
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
