import { FastifyInstance } from "fastify";
import { paginationSchema } from "../../utils/schemas";
import { createReservation } from "../../models/reservations/createReservation";
import { cancelReservation } from "../../models/reservations/cancelReservation";
import { getReservationsByUserId } from "../../models/reservations/getReservationByUser";
import { getAllReservationsByRideId } from "../../models/reservations/getReservationsByRide";
import { getConfirmedReservationsByRideId } from "../../models/reservations/getConfirmedReservationsByRideId";
import {
  createReservationSchema,
  reservationIdSchema,
} from "../../models/reservations/validations/schemas";

export async function reservationController(app: FastifyInstance) {
  app.post(
    "/reservations/:ride_id",
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

  app.get("/reservations/rides/:ride_id", getAllReservationsByRideId);

  app.get(
    "/reservations/rides/:ride_id/confirmed",
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
