import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";

export async function getRidesByDriver(
  request: FastifyRequest<{
    Querystring: { page: number; pageSize: number };
  }>,
  reply: FastifyReply
) {
  const driverId = request.userData?.id;
  const { page = 1, pageSize = 10 } = request.query;

  try {
    const skip = (page - 1) * pageSize;
    const rides = await models.ride.findMany({
      where: { driver_id: driverId },
      orderBy: { start_time: "desc" },
      skip,
      take: pageSize,
      include: {
        StartAddress: true,
        EndAddress: true,
      },
    });

    return reply.send({ data: rides });
  } catch (error) {
    console.error("Erro ao buscar corridas pelo motorista:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function getRidesByStartCity(
  request: FastifyRequest<{
    Querystring: { page: number; pageSize: number };
    Params: { city: string };
  }>,
  reply: FastifyReply
) {
  const { city } = request.params;
  const { page = 1, pageSize = 10 } = request.query;

  try {
    const skip = (page - 1) * pageSize;
    const rides = await models.ride.findMany({
      where: {
        StartAddress: {
          city: { contains: city },
        },
      },
      orderBy: { start_time: "desc" },
      skip,
      take: pageSize,
      include: {
        StartAddress: true,
        EndAddress: true,
      },
    });

    return reply.send({ data: rides });
  } catch (error) {
    console.error("Erro ao buscar corridas pela cidade de saída:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function getRidesByDestinationCity(
  request: FastifyRequest<{
    Querystring: { page: number; pageSize: number };
    Params: { city: string };
  }>,
  reply: FastifyReply
) {
  const { city } = request.params;
  const { page = 1, pageSize = 10 } = request.query;

  try {
    const skip = (page - 1) * pageSize;
    const rides = await models.ride.findMany({
      where: {
        EndAddress: {
          city: { contains: city },
        },
      },
      orderBy: { start_time: "desc" },
      skip,
      take: pageSize,
      include: {
        StartAddress: true,
        EndAddress: true,
      },
    });

    return reply.send({ data: rides });
  } catch (error) {
    console.error("Erro ao buscar corridas pelo destino:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
