import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../models";
import { Prisma } from "@prisma/client";

export const deleteUser = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const id = request.userData?.id;
  if (!id) {
    throw new Error("Erro ao validar o id.");
  }
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
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
