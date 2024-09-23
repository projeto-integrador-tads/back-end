import "fastify";
import WebSocket from "ws";

interface JwtPayload {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: import("fastify").FastifyMiddleware;
  }

  interface FastifyRequest {
    userData?: JwtPayload;
  }

  interface FastifyContextConfig {
    public?: boolean;
  }

  interface FastifyInstance {
    jwtAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
