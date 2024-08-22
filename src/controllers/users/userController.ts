import { FastifyPluginAsync } from "fastify";
import { userSchema } from "../../utils/schemas";
import { registerUser } from "../../models/users/registerUser";
import { getUserById } from "../../models/users/getUser";
import { deleteUser } from "../../models/users/deleteUser";

export const userController: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/users",
    {
      schema: {
        body: userSchema,
      },
    },
    registerUser
  );

  fastify.get("/users/:id", getUserById);
  fastify.delete("/users/:id", deleteUser);
};
