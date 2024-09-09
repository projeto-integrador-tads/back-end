import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../../models/models";

export const cancelReservation = async (
  request: FastifyRequest<{ Params: { reservation_id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { reservation_id } = request.params;
    const passenger_id = request.userData?.id;

    if (!passenger_id) {
      return reply.status(401).send({ error: "Usuário não está logado." });
    }

    // Verificar se a reserva existe
    const reservation = await models.reservation.findUnique({
      where: { reservation_id },
    });

    if (!reservation) {
      return reply.status(404).send({ error: "Reserva não encontrada." });
    }

    if (reservation.status === "CANCELLED") {
      return reply.status(403).send({
        error: "Você já cancelou essa reserva.",
      });
    }

    // Verificar se a reserva pertence ao passageiro atual
    if (reservation.passenger_id !== passenger_id) {
      return reply.status(403).send({
        error: "Você não tem permissão para cancelar esta reserva.",
      });
    }

    // Atualizar o status da reserva para "CANCELLED"
    await models.reservation.update({
      where: { reservation_id },
      data: { status: "CANCELLED" },
    });

    // Verificar o número de assentos disponíveis antes da atualização
    const ride = await models.ride.findUnique({
      where: { ride_id: reservation.ride_id },
    });

    if (!ride) {
      return reply.status(404).send({ error: "Corrida não encontrada." });
    }

    // Atualizar o número de assentos disponíveis na corrida
    await models.ride.update({
      where: { ride_id: reservation.ride_id },
      data: { available_seats: ride.available_seats + 1 },
    });

    return reply
      .status(200)
      .send({ message: "Reserva cancelada com sucesso." });
  } catch (error) {
    console.error("Erro ao cancelar a reserva:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
