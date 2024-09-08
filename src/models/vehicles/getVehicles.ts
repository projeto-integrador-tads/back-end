import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";

export async function listActiveVehicles(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const owner_id = request.userData?.id;

  if (!owner_id) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const vehicles = await models.vehicle.findMany({
      where: {
        active: true,
        owner_id,
      },
    });

    return reply.status(200).send(vehicles);
  } catch (error) {
    console.error("Erro ao listar veículos ativos do proprietário:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}

export async function listInactiveVehicles(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const owner_id = request.userData?.id;

  if (!owner_id) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const vehicles = await models.vehicle.findMany({
      where: {
        active: false,
        owner_id,
      },
    });

    return reply.status(200).send(vehicles);
  } catch (error) {
    console.error("Erro ao listar veículos inativos do proprietário:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}