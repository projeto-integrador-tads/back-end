import { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import { z } from "zod";
import { loginSchema } from "../../utils/schemas";
import { models } from "../models";

type LoginRequestBody = z.infer<typeof loginSchema>;

export default async function loginHandler(
  request: FastifyRequest<{ Body: LoginRequestBody }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  try {
    const user = await models.user.findUnique({
      where: { email },
      select: { password: true, name: true, last_name: true, id: true },
    });

    if (!user) {
      return reply.status(401).send({ error: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return reply.status(401).send({ error: "Senha incorreta." });
    }

    const token = request.server.jwt.sign({
      email,
      firstName: user.name,
      lastName: user.last_name,
      id: user.id,
    });

    reply.send({ token });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
