import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { forgotPasswordSchema, resetPasswordSchema, userSchema, verifyResetCodeSchema } from "../../utils/schemas";
import { registerUser } from "../../models/users/registerUser";
import { getUserById } from "../../models/users/getUser";
import { deleteUser } from "../../models/users/deleteUser";
import { forgotPassword } from "../../models/authModel/forgotPassword";
import { verifyResetCode } from "../../models/authModel/verifyResetCode";
import { resetPassword } from "../../models/authModel/resetPassword";

interface GetUserByIdParams {
  id: string;
}

export const userController: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  fastify.post(
    "/users",
    {
      schema: {
        body: userSchema,
      },
      config: { public: true },
    },
    registerUser
  );

  fastify.get<{ Params: GetUserByIdParams }>(
    "/users/:id",

    getUserById
  );
  fastify.delete<{ Params: GetUserByIdParams }>("/users/:id", deleteUser);

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
};
