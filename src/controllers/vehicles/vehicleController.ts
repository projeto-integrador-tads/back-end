import { FastifyPluginAsync } from "fastify";
import {
  vehicleSchema,
  deleteVehicleSchema,
  reactivateVehicleSchema,
  updateVehicleSchema,
  paginationSchema,
} from "../../utils/schemas";
import { registerVehicle } from "../../models/vehicles/registerVehicle";
import { deleteVehicle } from "../../models/vehicles/deleteVehicle";
import {
  listActiveVehicles,
  listInactiveVehicles,
} from "../../models/vehicles/getVehicles";
import { reactivateVehicle } from "../../models/vehicles/reactivateVehicle";
import { updateVehicle } from "../../models/vehicles/updateVehicle";

export const vehicleController: FastifyPluginAsync = async (app) => {
  app.post(
    "/vehicles",
    {
      schema: {
        body: vehicleSchema,
      },
    },
    registerVehicle
  );

  app.get(
    "/vehicles/active",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    listActiveVehicles
  );
  app.get(
    "/vehicles/inactive",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    listInactiveVehicles
  );

  app.post(
    "/vehicles/reactivate/:vehicle_id",
    {
      schema: {
        params: reactivateVehicleSchema,
      },
    },
    reactivateVehicle
  );

  app.delete(
    "/vehicles/:vehicle_id",
    {
      schema: {
        params: deleteVehicleSchema,
      },
    },
    deleteVehicle
  );

  app.put(
    "/vehicles",
    {
      schema: {
        body: updateVehicleSchema,
      },
    },
    updateVehicle
  );
};
