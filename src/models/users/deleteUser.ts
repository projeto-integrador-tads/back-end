import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../models";
import { eventTypes } from "../../utils/constants";

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  const id = request.userData?.id;
  try {
    const user = await models.user.findUnique({
      where: { id },
    });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    if (!user.active) {
      return reply
        .status(400)
        .send({ error: "Esta conta já está desativada." });
    }

    const deletedUser = await models.user.update({
      where: { id },
      data: { active: false },
    });

    request.server.eventBus.emit(eventTypes.accountDeactivated, deletedUser);

    return reply.status(204).send();
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
