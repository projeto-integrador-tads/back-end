import { FastifyInstance } from "fastify";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  userSchema,
  verifyResetCodeSchema,
} from "../../utils/schemas";
import loginHandler from "../../models/auth/authModel";
import { registerUser } from "../../models/users/registerUser";
import { forgotPassword } from "../../models/auth/forgotPassword";
import { verifyResetCode } from "../../models/auth/verifyResetCode";
import { resetPassword } from "../../models/auth/resetPassword";

export async function authController(fastify: FastifyInstance) {
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

  fastify.post(
    "/register",
    {
      schema: {
        body: userSchema,
      },
      config: { public: true },
    },
    registerUser
  );

  fastify.post(
    "/forgot-password",
    {
      schema: {
        body: forgotPasswordSchema,
      },
      config: { public: true },
    },
    forgotPassword
  );

  fastify.post(
    "/verify-reset-code",
    {
      schema: {
        body: verifyResetCodeSchema,
      },
      config: { public: true },
    },
    verifyResetCode
  );

  fastify.post(
    "/reset-password",
    {
      schema: {
        body: resetPasswordSchema,
      },
      config: { public: true },
    },
    resetPassword
  );
}
