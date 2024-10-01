import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { paginate } from "../../utils/paginate";
import { Reservation, ReservationStatus } from "@prisma/client";
import { sanitizeReservation } from "../../utils/sanitize";
import { getConfirmedReservationsByRideIdInput } from "../../types";

export async function getConfirmedReservationsByRideId(
  request: FastifyRequest<{
    Params: { rideId: string };
    Querystring: getConfirmedReservationsByRideIdInput;
  }>,
  reply: FastifyReply
) {
  const { rideId } = request.params;
  const { page = 1, perPage = 10 } = request.query;

  try {
    const paginatedReservations = await paginate<Reservation, "reservation">(
      models.reservation,
      {
        where: { ride_id: rideId, status: ReservationStatus.CONFIRMED },
        orderBy: { createdAt: "desc" },
      },
      page,
      perPage,
      sanitizeReservation
    );

    return reply.status(200).send(paginatedReservations);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
}
