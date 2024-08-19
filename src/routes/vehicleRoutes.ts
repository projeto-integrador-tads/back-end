import { FastifyPluginAsync } from "fastify";
import { vehicleSchema } from "../utils/schemas";
import { registerVehicle } from "../controllers/vehicles/vehicleController";

export const vehicleRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/vehicles",
    {
      schema: {
        body: vehicleSchema,
      },
    },
    registerVehicle
  );
};
