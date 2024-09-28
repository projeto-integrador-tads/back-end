import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { paginate } from "../../utils/paginate";
import { sanitizeVehicle } from "../../utils/sanitize";
import { PaginationInput } from "../../types";
import { Vehicle } from "@prisma/client";

export async function listActiveVehicles(
  request: FastifyRequest<{
    Querystring: PaginationInput;
  }>,
  reply: FastifyReply
) {
  const ownerId = request.userData?.id;
  const { page = 1, perPage = 10 } = request.query;

  if (!ownerId) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const paginatedVehicles = await paginate<Vehicle, "vehicle">(
      models.vehicle,
      {
        where: {
          active: true,
          owner_id: ownerId,
        },
      },
      page,
      perPage,
      sanitizeVehicle
    );

    return reply.status(200).send(paginatedVehicles);
  } catch (error) {
    console.error("Erro ao listar veículos ativos do proprietário:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function listInactiveVehicles(
  request: FastifyRequest<{
    Querystring: PaginationInput;
  }>,
  reply: FastifyReply
) {
  const ownerId = request.userData?.id;
  const { page, perPage } = request.query;

  if (!ownerId) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const paginatedVehicles = await paginate<Vehicle, "vehicle">(
      models.vehicle,
      {
        where: {
          active: false,
          owner_id: ownerId,
        },
      },
      page,
      perPage,
      sanitizeVehicle
    );

    return reply.status(200).send(paginatedVehicles);
  } catch (error) {
    console.error("Erro ao listar veículos inativos do proprietário:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
