import { FastifyInstance } from "fastify";
import {
  createReservationSchema,
  paginationSchema,
  reservationIdSchema,
} from "../../utils/schemas";
import { createReservation } from "../../models/reservations/createReservation";
import { cancelReservation } from "../../models/reservations/cancelReservation";
import { getReservationsByUserId } from "../../models/reservations/getReservationByUser";
import { getAllReservationsByRideId } from "../../models/reservations/getReservationsByRide";
import { getConfirmedReservationsByRideId } from "../../models/reservations/getConfirmedReservationsByRideId";

export async function reservationController(app: FastifyInstance) {
  app.post(
    "/reservations/:rideId",
    {
      schema: {
        params: createReservationSchema,
      },
    },
    createReservation
  );

  app.get(
    "/reservations/users",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    getReservationsByUserId
  );

  app.get("/reservations/rides/:rideId", getAllReservationsByRideId);

  app.get(
    "/reservations/rides/:rideId/confirmed",
    {
      schema: {
        querystring: paginationSchema,
        params: reservationIdSchema,
      },
    },
    getConfirmedReservationsByRideId
  );

  app.post("/reservations/cancel/:reservation_id", cancelReservation);
}
