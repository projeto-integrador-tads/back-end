import { FastifyPluginAsync } from "fastify";
import { createRideSchema, updateRideSchema } from "../../utils/schemas";
import { createRide } from "../../models/rides/createRide";
import { updateRide } from "../../models/rides/updateRide";

export const ridesController: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/rides",
    {
      schema: {
        body: createRideSchema,
      },
    },
    createRide
  );

  fastify.put(
    "/rides",
    {
      schema: {
        body: updateRideSchema,
      },
    },
    updateRide
  );
};
