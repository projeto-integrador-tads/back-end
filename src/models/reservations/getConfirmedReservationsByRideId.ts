import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";

export async function getConfirmedReservationsByRideId(
  request: FastifyRequest<{ Params: { ride_id: string } }>,
  reply: FastifyReply
) {
  const { ride_id } = request.params;

  try {
    // Obtém apenas as reservas confirmadas da corrida
    const confirmedReservations = await models.reservation.findMany({
      where: { ride_id, status: "CONFIRMED" },
    });

    if (confirmedReservations.length === 0) {
      return reply
        .status(404)
        .send({
          error: "Nenhuma reserva confirmada encontrada para esta corrida.",
        });
    }

    return reply.status(200).send(confirmedReservations);
  } catch (error) {
    console.error("Erro ao buscar reservas confirmadas:", error);
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
}
