import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../models";
import { verifyResetCodeSchema } from "../../utils/schemas";
import { z } from "zod";

type ForgotPasswordRequestBody = z.infer<typeof verifyResetCodeSchema>;

export async function verifyResetCode(
  request: FastifyRequest<{ Body: ForgotPasswordRequestBody }>,
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
        error: "O número máximo de tentativas foi atingido."
      });
    }

    if (passwordReset.expiresAt < new Date()) {
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