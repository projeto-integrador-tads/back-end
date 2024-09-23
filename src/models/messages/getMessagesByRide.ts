import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { paginate } from "../../utils/paginate";
import { Message } from "@prisma/client";

export async function getMessagesByRide(
  request: FastifyRequest<{
    Params: { ride_id: string };
    Querystring: { page: number; perPage: number };
  }>,
  reply: FastifyReply
) {
  const { ride_id } = request.params;
  const { page = 1, perPage = 10 } = request.query;
  const user_id = request.userData?.id;

  if (!user_id) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const ride = await models.ride.findUnique({
      where: { ride_id },
      select: { driver_id: true },
    });

    if (!ride) {
      return reply.status(404).send({ error: "Corrida não encontrada." });
    }

    const isDriver = ride.driver_id === user_id;
    const otherUserId = isDriver ? { not: ride.driver_id } : ride.driver_id;

    const paginatedMessages = await paginate<Message, "message">(
      models.message,
      {
        where: {
          ride_id,
          OR: [
            { sender_id: user_id, receiver_id: otherUserId },
            { sender_id: otherUserId, receiver_id: user_id },
          ],
        },
        orderBy: { createdAt: "desc" },
      },
      page,
      perPage
    );

    return reply.send(paginatedMessages);
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
