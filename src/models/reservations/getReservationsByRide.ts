import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";

export async function getAllReservationsByRideId(
  request: FastifyRequest<{ Params: { ride_id: string } }>,
  reply: FastifyReply
) {
  const { ride_id } = request.params;
  const driver_id = request.userData?.id;

  try {
    // Obtém a corrida para verificar o driver_id
    const ride = await models.ride.findUnique({
      where: { ride_id },
      select: { driver_id: true }, // Apenas precisamos do driver_id
    });

    if (!ride) {
      return reply.status(404).send({ error: "Corrida não encontrada." });
    }

    // Verifica se o motorista é o mesmo que está solicitando
    if (ride.driver_id !== driver_id) {
      return reply.status(403).send({ error: "Acesso não autorizado." });
    }

    // Obtém as reservas da corrida
    const reservations = await models.reservation.findMany({
      where: { ride_id },
    });

    if (reservations.length === 0) {
      return reply
        .status(404)
        .send({ error: "Nenhuma reserva encontrada para esta corrida." });
    }

    return reply.status(200).send(reservations);
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
}
