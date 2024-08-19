import { FastifyPluginAsync } from "fastify";
import { createRideSchema } from "../utils/schemas";
import { createRideHandler } from "../controllers/rides/ridesController";
// import { createRideHandler } from "../controllers/rides/rideController";

export const rideRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/rides",
    {
      schema: {
        body: createRideSchema,
      },
    },
    createRideHandler
  );
};
