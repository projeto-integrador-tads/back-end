import { FastifyRequest, FastifyReply } from "fastify";
import { Prisma } from "@prisma/client";
import { models } from "../../models/models";
import { hashPassword } from "../../services/security/userService";
import { userSchema } from "../../utils/schemas";
import { TypeOf } from "zod";

type UserRequestBody = TypeOf<typeof userSchema>;

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

    return { user_id: user.id };
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

export const getUserById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const id = request.params.id;
  try {
    const user = await models.user.findUnique({ where: { id } });
    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    const data = {
      id: user.id,
      name: user.name,
      lastName: user.last_name,
      email: user.email,
    };

    return data;
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};

export const deleteUser = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const id = request.params.id;
  try {
    await models.user.update({
      where: { id },
      data: { active: false },
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
