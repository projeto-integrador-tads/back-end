import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fastifyJWT from "@fastify/jwt";
import { JwtPayload } from "../types";
import env from "../../env";

async function jwtAuth(fastify: FastifyInstance) {
  const JWT_SIGNING_SECRET = env.JWT_SECRET;
  fastify.register(fastifyJWT, {
    secret: JWT_SIGNING_SECRET!,
  });

  fastify.decorate(
    "jwtAuth",
    async function (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      try {
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
