import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../models";
import { UserIdSchema } from "../../types";

export const deleteUser = async (
  request: FastifyRequest<{ Params: UserIdSchema }>,
  reply: FastifyReply
) => {
  const id = request.userData?.id;
  try {
    const user = await models.user.update({
      where: { id },
      data: { active: false },
    });

    request.server.eventBus.emit("accountDeactivated", {
      email: user.email,
      name: user.name,
    });

    return reply.status(204).send();
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
