import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { userSchema } from "../../utils/schemas";
import { registerUser } from "../../models/users/registerUser";
import { getUserById } from "../../models/users/getUser";
import { deleteUser } from "../../models/users/deleteUser";

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
};
