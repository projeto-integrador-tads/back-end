import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { models } from "../models";
import { updateUserSchema } from "../../utils/schemas";
import { sanitizeUser } from "../../utils/sanitize";

type UpdateUserInput = z.infer<typeof updateUserSchema>;

export async function updateUser(
  request: FastifyRequest<{
    Body: UpdateUserInput;
  }>,
  reply: FastifyReply
) {
  const { name, last_name, phone_number } = request.body;
  const id = request.userData?.id;

  try {
    if (!name && !last_name && !phone_number) {
      return reply
        .status(400)
        .send({ error: "Informe pelo menos um campo para alterar." });
    }

    const user = await models.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    const updateData: {
      name?: string;
      last_name?: string;
      phone_number?: string | null;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (phone_number !== undefined)
      updateData.phone_number = phone_number || null;

    const updatedUser = await models.user.update({
      where: { id: id },
      data: updateData,
    });

    return reply.status(200).send(sanitizeUser(updatedUser));
  } catch (error) {
    console.error("Erro ao atualizar o usuário:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
