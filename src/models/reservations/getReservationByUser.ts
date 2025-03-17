import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { paginate } from "../../utils/paginate";
import { Reservation } from "@prisma/client";
import { sanitizeReservation } from "../../utils/sanitize";
import { getReservationsByUserInputQueryString } from "../../types";

export async function getReservationsByUserId(
  request: FastifyRequest<{
    Querystring: getReservationsByUserInputQueryString;
  }>,
  reply: FastifyReply
) {
  const { page = 1, perPage = 10 } = request.query;
  const userId = request.userData?.id;

  try {
    const reservations = await paginate<Reservation, "reservation">(
      models.reservation,
      {
        where: { passenger_id: userId },
        include: {
          Ride: {
            include: {
              Driver: {
                select: {
                  id: true,
                  name: true,
                  last_name: true,
                  phone_number: true,
                  average_rating: true,
                },
              },
              Vehicle: true,
              StartAddress: true,
              EndAddress: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      page,
      perPage
    );

    return reply.status(200).send(reservations);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
}
