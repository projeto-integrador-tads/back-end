import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../models";
import { sanitizeUser } from "../../utils/sanitize";

export const getUserById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const id = request.params.id;
  try {
    const user = await models.user.findUnique({ where: { id } });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    return sanitizeUser(user);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
