import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { dayjs } from "../../utils/dayjs";
import { eventTypes } from "../../utils/constants";

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.userData?.id;
  const token = request.headers.authorization?.split(" ")[1];

  if (!userId || !token) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    await models.token.create({
      data: {
        token,
        userId,
        expiresAt: dayjs().add(1, "day").toDate(),
      },
    });

    request.server.eventBus.emit(eventTypes.userLoggedOut, userId);

    return reply.status(200).send({ message: "Logout feito com sucesso." });
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno no servidor" });
  }
}
