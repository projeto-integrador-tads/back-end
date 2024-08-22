import { FastifyPluginAsync } from "fastify";
import { vehicleSchema } from "../../utils/schemas";
import { registerVehicle } from "../../models/vehicles/registerVehicle";

export const vehicleController: FastifyPluginAsync = async (fastify) => {
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
