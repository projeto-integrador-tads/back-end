// src/controllers/auth/loginController.ts

import { FastifyInstance } from "fastify";
import { loginSchema } from "../../utils/schemas";
import loginHandler from "../../models/authModel/authModel";

export async function loginController(fastify: FastifyInstance) {
  fastify.post(
    "/login",
    {
      schema: {
        body: loginSchema,
      },
      config: { public: true },
    },
    loginHandler
  );
}
