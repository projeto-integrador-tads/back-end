import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyJWT from "@fastify/jwt";
import { JwtPayload } from "../types";
import env from "../../env";
import { models } from "../models/models";

async function jwtAuth(fastify: FastifyInstance) {
  const JWT_SIGNING_SECRET = env.JWT_SECRET;
  fastify.register(fastifyJWT, {
    secret: JWT_SIGNING_SECRET,
    sign: {
      expiresIn: "1 day",
    },
  });

  fastify.decorate(
    "jwtAuth",
    async function (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      try {
        const token = request.headers.authorization?.split(" ")[1];

        if (token) {
          const blacklistedToken = await models.token.findUnique({
            where: { token },
          });

          if (blacklistedToken) {
            reply.status(401).send({
              message: "Token inválido ou expirado.",
            });
          }
        }

        const decoded = await request.jwtVerify<JwtPayload>();
        request.userData = decoded;
      } catch (err) {
        reply
          .status(401)
          .send({ message: "Você precisa estar logado para acessar a rota." });
      }
    }
  );

  fastify.addHook("onRequest", async (request, reply) => {
    if (!request.routeOptions.config.public) {
      await fastify.jwtAuth(request, reply);
    }
  });
}

export default fp(jwtAuth);
