import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { getUserById } from "../../models/users/getUser";
import { deleteUser } from "../../models/users/deleteUser";
import { uploadProfilePicture } from "../../models/users/uploadProfilePicture";
import { getProfilePicture } from "../../models/users/getProfilePicture";
import { removeProfilePicture } from "../../models/users/removeProfilePicture";
import { updateUser } from "../../models/users/updateUser";
import { updateUserSchema } from "../../utils/schemas";

interface GetUserByIdParams {
  id: string;
}

export const userController: FastifyPluginAsync = async (
  app: FastifyInstance
) => {
  app.get<{ Params: GetUserByIdParams }>("/users/:id", getUserById);

  app.delete<{ Params: GetUserByIdParams }>("/users/:id", deleteUser);

  app.post("/users/upload/img", uploadProfilePicture);

  app.get("/users/profile-picture", getProfilePicture);

  app.delete("/users/profile-picture", removeProfilePicture);

  app.put(
    "/users",
    {
      schema: {
        body: updateUserSchema,
      },
    },
    updateUser
  );
};
