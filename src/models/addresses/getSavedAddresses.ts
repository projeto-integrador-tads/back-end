import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { sanitizeAddress } from "../../utils/sanitize";

export const getSavedAddresses = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
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
        .send({ error: "Apenas motoristas podem acessar endereços salvos." });
    }

    const savedAddresses = await models.address.findMany({
      where: {
        userId,
        deleted: false,
      },
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
    });

    const sanitizedAddresses = savedAddresses.map(sanitizeAddress);

    return reply.status(200).send(sanitizedAddresses);
  } catch (error) {
    console.error("Erro ao buscar endereços salvos:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
