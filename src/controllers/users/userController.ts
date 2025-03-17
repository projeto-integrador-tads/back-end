import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { getUserById } from "../../models/users/getUser";
import { deleteUser } from "../../models/users/deleteUser";
import { uploadProfilePicture } from "../../models/users/uploadProfilePicture";
import { getProfilePicture } from "../../models/users/getProfilePicture";
import { removeProfilePicture } from "../../models/users/removeProfilePicture";
import { updateUser } from "../../models/users/updateUser";
import { getProfilePictureById } from "../../models/users/getProfilePictureById";
import { generateUserReport } from "../../models/users/getUserReport";
import {
  updateUserSchema,
  userIdSchema,
  reportQuerySchema,
} from "../../models/users/validations/schema";

export const userController: FastifyPluginAsync = async (
  app: FastifyInstance
) => {
  app.get(
    "/users/:id",
    {
      schema: {
        params: userIdSchema,
      },
    },
    getUserById
  );

  app.delete("/users", deleteUser);

  app.post("/users/upload/img", uploadProfilePicture);

  app.get("/users/profile-picture", getProfilePicture);

  app.get(
    "/users/:id/profile-picture",
    {
      schema: {
        params: userIdSchema,
      },
    },
    getProfilePictureById
  );

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

  app.get(
    "/users/report",
    {
      schema: {
        querystring: reportQuerySchema
      }
    },
    generateUserReport
  );
};
