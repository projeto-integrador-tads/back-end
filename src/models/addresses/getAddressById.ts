import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { sanitizeAddress } from "../../utils/sanitize";

export const getAddressById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const userId = request.userData?.id;
  try {
    const user = await models.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    if (!user.is_driver) {
      return reply
        .status(403)
        .send({ error: "Apenas motoristas podem acessar endereços." });
    }

    const address = await models.address.findUnique({
      where: { id, userId, deleted: false },
    });

    if (!address) {
      return reply.status(404).send({ error: "Endereço não encontrado." });
    }

    return reply.status(200).send(sanitizeAddress(address));
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
