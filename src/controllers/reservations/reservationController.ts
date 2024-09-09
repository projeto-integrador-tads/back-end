import { FastifyInstance } from "fastify";
import { createReservationSchema } from "../../utils/schemas";
import { createReservation } from "../../models/reservations/createReservation";
import { cancelReservation } from "../../models/reservations/cancelReservation";
import { getReservationsByUserId } from "../../models/reservations/getReservationByUser";
import { getAllReservationsByRideId } from "../../models/reservations/getReservationsByRide";
import { getConfirmedReservationsByRideId } from "../../models/reservations/getConfirmedReservationsByRideId";

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

  fastify.get("/reservations/users/:user_id", getReservationsByUserId);
  fastify.get("/reservations/rides/:ride_id", getAllReservationsByRideId);
  fastify.get(
    "/reservations/rides/:ride_id/confirmed",
    getConfirmedReservationsByRideId
  );

  fastify.post("/reservations/cancel/:reservation_id", cancelReservation);
}
