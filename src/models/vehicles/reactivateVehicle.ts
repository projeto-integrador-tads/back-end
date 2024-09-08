import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { TypeOf } from "zod";
import { reactivateVehicleSchema } from "../../utils/schemas";

type VehicleIdParams = TypeOf<typeof reactivateVehicleSchema>;

export async function reactivateVehicle(
  request: FastifyRequest<{ Params: VehicleIdParams }>,
  reply: FastifyReply
) {
  const { vehicle_id } = request.params;
  const owner_id = request.userData?.id;

  if (!owner_id) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const vehicle = await models.vehicle.findUnique({
      where: { vehicle_id },
    });

    if (!vehicle) {
      return reply.status(404).send({ error: "Veículo não encontrado." });
    }

    if (vehicle.owner_id !== owner_id) {
      return reply
        .status(403)
        .send({ error: "Você não tem permissão para reativar este veículo." });
    }

    if (vehicle.active) {
      return reply.status(400).send({ error: "O veículo já está ativo." });
    }

    const reactivatedVehicle = await models.vehicle.update({
      where: { vehicle_id },
      data: { active: true },
    });

    return reply.status(200).send(reactivatedVehicle);
  } catch (error) {
    console.error("Erro ao reativar o veículo:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
