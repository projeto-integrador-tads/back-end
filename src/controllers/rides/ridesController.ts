import { FastifyPluginAsync } from "fastify";
import {
  cancelRideSchema,
  createRideSchema,
  paginationSchema,
  updateRideSchema,
} from "../../utils/schemas";
import { createRide } from "../../models/rides/createRide";
import { updateRide } from "../../models/rides/updateRide";
import { getRidesByDriver } from "../../models/rides/getRides";
import { cancelRide } from "../../models/rides/cancelRide";
import {
  getRidesByStartCity,
  getRidesByDestinationCity,
} from "../../models/rides/getRides";

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

  fastify.delete(
    "/rides",
    {
      schema: {
        body: cancelRideSchema,
      },
    },
    cancelRide
  );

  fastify.get(
    "/rides/driver",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    getRidesByDriver
  );
  fastify.get(
    "/rides/start-city/:city",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    getRidesByStartCity
  );
  fastify.get(
    "/rides/destination-city/:city",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    getRidesByDestinationCity
  );
};
