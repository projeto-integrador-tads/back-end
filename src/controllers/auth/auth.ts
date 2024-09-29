import { FastifyInstance } from "fastify";
import loginHandler from "../../models/auth/login";
import { registerUser } from "../../models/users/registerUser";
import { forgotPassword } from "../../models/auth/forgotPassword";
import { verifyResetCode } from "../../models/auth/verifyResetCode";
import { resetPassword } from "../../models/auth/resetPassword";
import { userSchema } from "../../models/users/validations/schema";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
} from "../../models/auth/validations/schemas";

export async function authController(app: FastifyInstance) {
  app.post(
    "/login",
    {
      schema: {
        body: loginSchema,
      },
      config: { public: true },
    },
    loginHandler
  );

  app.post(
    "/register",
    {
      schema: {
        body: userSchema,
      },
      config: { public: true },
    },
    registerUser
  );

  app.post(
    "/forgot-password",
    {
      schema: {
        body: forgotPasswordSchema,
      },
      config: { public: true },
    },
    forgotPassword
  );

  app.post(
    "/verify-reset-code",
    {
      schema: {
        body: verifyResetCodeSchema,
      },
      config: { public: true },
    },
    verifyResetCode
  );

  app.post(
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
