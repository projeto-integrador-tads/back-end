import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { VehicleIdParams } from "../../types";
import { findVehicle, vehicleCheckOwnership } from "./validation/validation";
import { handleValidationError } from "../../exeptions/handleValidationError";

export async function reactivateVehicle(
  request: FastifyRequest<{ Params: VehicleIdParams }>,
  reply: FastifyReply
) {
  const { vehicle_id: vehicleId } = request.params;
  const ownerId = request.userData?.id;

  if (!ownerId) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const vehicle = await findVehicle(vehicleId);
    vehicleCheckOwnership(vehicle, ownerId);

    if (vehicle.active) {
      return reply.status(400).send({ error: "O veículo já está ativo." });
    }

    const reactivatedVehicle = await models.vehicle.update({
      where: { vehicle_id: vehicleId },
      data: { active: true },
    });

    return reply.status(200).send(reactivatedVehicle);
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
