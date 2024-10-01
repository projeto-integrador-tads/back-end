import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { generateResetCode } from "./resetCode";
import { dayjs } from "../../utils/dayjs";
import { eventTypes } from "../../utils/constants";
import { ForgotPasswordRequestBody } from "../../types";

export async function forgotPassword(
  request: FastifyRequest<{ Body: ForgotPasswordRequestBody }>,
  reply: FastifyReply
) {
  const { email } = request.body;

  try {
    const user = await models.user.findUnique({ where: { email } });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    const existingToken = await models.passwordResetToken.findUnique({
      where: { email },
    });

    const now = dayjs();
    if (
      existingToken &&
      now.diff(existingToken.lastEmailSentAt, "second") < 60
    ) {
      return reply.status(429).send({
        error:
          "Por favor, aguarde 60 segundos antes de solicitar um novo código.",
      });
    }

    const resetCode = generateResetCode();
    const expiresAt = dayjs().add(15, "minutes").toDate();
    const lastEmailSentAt = dayjs().toDate();

    await models.passwordResetToken.upsert({
      where: { email },
      update: {
        resetCode,
        expiresAt,
        attempts: 0,
        lastEmailSentAt,
      },
      create: {
        email,
        resetCode,
        expiresAt,
        attempts: 0,
        lastEmailSentAt,
      },
    });

    request.server.eventBus.emit(eventTypes.forgotPassword, {
      email,
      name: user.name,
      resetCode,
    });

    return reply
      .status(200)
      .send({ message: "Código de recuperação de senha enviado com sucesso." });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
