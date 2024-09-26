import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../models";

export const deleteAddress = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const userId = request.userData?.id;

  const user = await models.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return reply.status(404).send({ error: "Usuário não encontrado." });
  }

  if (!user.is_driver) {
    return reply
      .status(403)
      .send({ error: "Apenas motoristas podem excluir endereços." });
  }

  const address = await models.address.findUnique({
    where: { id },
  });

  if (!address) {
    return reply.status(404).send({ error: "Endereço não encontrado." });
  }

  if (address.userId !== userId) {
    return reply
      .status(403)
      .send({ error: "Você não tem permissão para excluir este endereço." });
  }

  if (address.deleted) {
    return reply.status(400).send({ error: "Este endereço já foi excluído." });
  }

  await models.address.update({
    where: { id },
    data: { deleted: true },
  });

  return reply.status(204).send();
};
