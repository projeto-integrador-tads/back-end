import { FastifyPluginAsync } from "fastify";
import {
  vehicleSchema,
  deleteVehicleSchema,
  reactivateVehicleSchema,
} from "../../utils/schemas";
import { registerVehicle } from "../../models/vehicles/registerVehicle";
import { deleteVehicle } from "../../models/vehicles/deleteVehicle";
import {
  listActiveVehicles,
  listInactiveVehicles,
} from "../../models/vehicles/getVehicles";
import { reactivateVehicle } from "../../models/vehicles/reactivateVehicle";

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

  fastify.get("/vehicles/active", listActiveVehicles);
  fastify.get("/vehicles/inactive", listInactiveVehicles);

  fastify.post(
    "/vehicles/reactivate/:vehicle_id",
    {
      schema: {
        params: reactivateVehicleSchema,
      },
    },
    reactivateVehicle
  );

  fastify.delete(
    "/vehicles/:vehicle_id",
    {
      schema: {
        params: deleteVehicleSchema,
      },
    },
    deleteVehicle
  );
};
