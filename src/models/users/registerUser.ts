import { FastifyRequest, FastifyReply } from "fastify";
import { Prisma } from "@prisma/client";
import { models } from "../../models/models";
import { hashPassword } from "../../services/security/encrypt";
import { sanitizeUser } from "../../utils/sanitize";
import { UserRequestBody } from "../../types";

export const registerUser = async (
  request: FastifyRequest<{ Body: UserRequestBody }>,
  reply: FastifyReply
) => {
  const { name, last_name, email, password, phone_number } = request.body;

  try {
    const hashedPassword = await hashPassword(password);

    const user = await models.user.create({
      data: {
        name,
        last_name,
        email,
        password: hashedPassword,
        phone_number,
      },
    });

    request.server.eventBus.emit("userRegistered", user);

    return sanitizeUser(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return reply.status(409).send({ error: "O email já existe." });
    }
    console.error(error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
