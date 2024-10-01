import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../models";
import { VerifyResetCode } from "../../types";
import { dayjs } from "../../utils/dayjs";

export async function verifyResetCode(
  request: FastifyRequest<{ Body: VerifyResetCode }>,
  reply: FastifyReply
) {
  const { email, resetCode } = request.body;

  try {
    const passwordReset = await models.passwordResetToken.findUnique({
      where: { email },
    });

    if (!passwordReset) {
      return reply.status(404).send({ error: "Código não encontrado." });
    }

    if (passwordReset.attempts >= 3) {
      return reply.status(400).send({
        error: "O número máximo de tentativas foi atingido.",
      });
    }

    const now = dayjs();
    const expiresAt = dayjs(passwordReset.expiresAt);

    if (now.isAfter(expiresAt)) {
      return reply.status(400).send({ error: "Código expirado." });
    }

    if (passwordReset.resetCode !== resetCode) {
      await models.passwordResetToken.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      return reply.status(400).send({ error: "Código inválido." });
    }

    return reply.status(200).send({ message: "Código verificado." });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
