import { FastifyPluginAsync } from "fastify";
import { userSchema } from "../utils/schemas";
import {
  deleteUser,
  getUserById,
  registerUser,
} from "../controllers/users/userController";

export const userRoutes: FastifyPluginAsync = async (fastify) => {
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
