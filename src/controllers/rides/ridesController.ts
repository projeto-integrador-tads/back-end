import { FastifyPluginAsync } from "fastify";
import { paginationSchema } from "../../utils/schemas";
import { createRide } from "../../models/rides/createRide";
import { updateRide } from "../../models/rides/updateRide";
import { getRideById, getRidesByDriver } from "../../models/rides/getRides";
import { cancelRide } from "../../models/rides/cancelRide";
import {
  getRidesByStartCity,
  getRidesByDestinationCity,
} from "../../models/rides/getRides";
import { startRide } from "../../models/rides/startRide";
import {
  createRideSchema,
  rideIdSchema,
  updateRideSchema,
} from "../../models/rides/validations/schemas";
import { endRide } from "../../models/rides/endRide";

export const ridesController: FastifyPluginAsync = async (app) => {
  app.post(
    "/rides",
    {
      schema: {
        body: createRideSchema,
      },
    },
    createRide
  );

  app.put(
    "/rides",
    {
      schema: {
        body: updateRideSchema,
      },
    },
    updateRide
  );

  app.delete(
    "/rides/:id",
    {
      schema: {
        params: rideIdSchema,
      },
    },
    cancelRide
  );

  app.get(
    "/rides/driver",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    getRidesByDriver
  );
  app.get(
    "/rides/start-city/:city",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    getRidesByStartCity
  );
  app.get(
    "/rides/destination-city/:city",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    getRidesByDestinationCity
  );

  app.get(
    "/rides/:ride_id",
    {
      schema: {
        params: rideIdSchema,
      },
    },
    getRideById
  );

  app.post(
    "/rides/start/:ride_id",
    { schema: { params: rideIdSchema } },
    startRide
  );

  app.post(
    "/rides/end/:ride_id",
    { schema: { params: rideIdSchema } },
    endRide
  );
};
