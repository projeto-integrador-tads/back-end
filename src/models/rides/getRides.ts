import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { paginate } from "../../utils/paginate";
import { Ride } from "@prisma/client";
import { validateDriver } from "./validations/validations";
import { ValidationError } from "../../exeptions/validationError";
import { PaginationInput, SearchRide, SearchRideByCity } from "../../types";
import { handleValidationError } from "../../exeptions/handleValidationError";

export async function getRidesByDriver(
  request: FastifyRequest<{
    Querystring: PaginationInput;
  }>,
  reply: FastifyReply
) {
  const driverId = request.userData?.id;
  const { page = 1, perPage = 10 } = request.query;

  try {
    await validateDriver(driverId);

    const paginatedRides = await paginate<Ride, "ride">(
      models.ride,
      {
        where: { driver_id: driverId },
        orderBy: { start_time: "desc" },
        include: {
          StartAddress: true,
          EndAddress: true,
        },
      },
      page,
      perPage
    );

    return reply.send(paginatedRides);
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function getRidesByStartCity(
  request: FastifyRequest<{
    Querystring: PaginationInput;
    Params: SearchRideByCity;
  }>,
  reply: FastifyReply
) {
  const { city } = request.params;
  const { page = 1, perPage = 10 } = request.query;

  try {
    const paginatedRides = await paginate<Ride, "ride">(
      models.ride,
      {
        where: {
          StartAddress: {
            city: { contains: city },
          },
        },
        orderBy: { start_time: "desc" },
        include: {
          StartAddress: true,
          EndAddress: true,
        },
      },
      page,
      perPage
    );

    return reply.send(paginatedRides);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function getRidesByDestinationCity(
  request: FastifyRequest<{
    Querystring: PaginationInput;
    Params: SearchRideByCity;
  }>,
  reply: FastifyReply
) {
  const { city } = request.params;
  const { page = 1, perPage = 10 } = request.query;

  try {
    const paginatedRides = await paginate<Ride, "ride">(
      models.ride,
      {
        where: {
          EndAddress: {
            city: { contains: city },
          },
        },
        orderBy: { start_time: "desc" },
        include: {
          StartAddress: true,
          EndAddress: true,
        },
      },
      page,
      perPage
    );

    return reply.send(paginatedRides);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function getRideById(
  request: FastifyRequest<{
    Params: SearchRide;
  }>,
  reply: FastifyReply
) {
  const { rideId } = request.params;

  try {
    const rideWithDetails = await models.ride.findUnique({
      where: { ride_id: rideId },
      include: {
        StartAddress: true,
        EndAddress: true,
      },
    });

    if (!rideWithDetails) {
      throw new ValidationError("Corrida não encontrada.");
    }

    return reply.status(200).send(rideWithDetails);
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
