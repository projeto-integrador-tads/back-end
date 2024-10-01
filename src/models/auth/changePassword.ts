import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../models";
import bcrypt from "bcrypt";
import { ChangePasswordRequestBody } from "../../types";
import { eventTypes } from "../../utils/constants";
import { hashPassword } from "../../services/security/encrypt";
import { getUser } from "../users/validations/validations";

export async function changePassword(
  request: FastifyRequest<{
    Body: ChangePasswordRequestBody;
  }>,
  reply: FastifyReply
) {
  const { currentPassword, newPassword } = request.body;
  const userId = request.userData?.id;

  if (!userId) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const user = await getUser(userId);

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return reply.status(401).send({ error: "Senha atual incorreta." });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await models.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    request.server.eventBus.emit(eventTypes.passwordChanged, user);

    return reply.status(200).send({ message: "Senha alterada com sucesso." });
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
