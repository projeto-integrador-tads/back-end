import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { paginate } from "../../utils/paginate";
import { Ride } from "@prisma/client";

export async function getRidesByDriver(
  request: FastifyRequest<{
    Querystring: { page: number; pageSize: number };
  }>,
  reply: FastifyReply
) {
  const driverId = request.userData?.id;
  const { page = 1, pageSize = 10 } = request.query;

  try {
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
      pageSize
    );

    return reply.send(paginatedRides);
  } catch (error) {
    console.error("Erro ao buscar corridas pelo motorista:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function getRidesByStartCity(
  request: FastifyRequest<{
    Querystring: { page: number; perPage: number };
    Params: { city: string };
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
    console.error("Erro ao buscar corridas pela cidade de saída:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function getRidesByDestinationCity(
  request: FastifyRequest<{
    Querystring: { page: number; perPage: number };
    Params: { city: string };
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
    console.error("Erro ao buscar corridas pelo destino:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
