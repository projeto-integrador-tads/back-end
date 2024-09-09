import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";

export async function getReservationsByUserId(
  request: FastifyRequest<{ Params: { user_id: string } }>,
  reply: FastifyReply
) {
  const { user_id } = request.params;
  const user_id_request = request.userData?.id;

  if (user_id !== user_id_request) {
    return reply
      .status(404)
      .send({
        error:
          "Você não tem autorização para listar as reservas de outros usuários.",
      });
  }

  try {
    // Obtém as reservas do usuário
    const reservations = await models.reservation.findMany({
      where: { passenger_id: user_id },
      include: {
        Ride: true,
      },
    });

    if (reservations.length === 0) {
      return reply
        .status(404)
        .send({ error: "Nenhuma reserva encontrada para este usuário." });
    }

    return reply.status(200).send(reservations);
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
}
