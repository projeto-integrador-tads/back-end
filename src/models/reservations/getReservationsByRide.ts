import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { ValidationError } from "../../exeptions/validationError";
import { handleValidationError } from "../../exeptions/handleValidationError";
import {
  getRideById,
  validateRideOwnership,
} from "../rides/validations/validations";
import { paginationSchema } from "../../utils/schemas";
import { z } from "zod";
import { Reservation } from "@prisma/client";
import { sanitizeReservation } from "../../utils/sanitize";
import { paginate } from "../../utils/paginate";

type GetAllReservationsByRideInput = z.infer<typeof paginationSchema>;

export async function getAllReservationsByRideId(
  request: FastifyRequest<{
    Params: { rideId: string };
    Querystring: GetAllReservationsByRideInput;
  }>,
  reply: FastifyReply
) {
  const { rideId } = request.params;
  const { page = 1, perPage = 10 } = request.query;
  const driver_id = request.userData?.id;

  if (!driver_id) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const ride = await getRideById(rideId);
    await validateRideOwnership(ride, driver_id);

    const reservations = await paginate<Reservation, "reservation">(
      models.reservation,
      {
        where: { ride_id: rideId },
        include: {
          Ride: true,
        },
      },
      page,
      perPage,
      sanitizeReservation
    );

    if (reservations.data.length === 0) {
      throw new ValidationError(
        "Nenhuma reserva encontrada para esta corrida."
      );
    }

    return reply.status(200).send(reservations);
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
}
