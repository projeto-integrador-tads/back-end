import "fastify";

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
    user: {
      id: string;
    };
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
