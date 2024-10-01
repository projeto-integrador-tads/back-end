import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { sanitizeVehicle } from "../../utils/sanitize";
import { findVehicle, vehicleCheckOwnership } from "./validation/validation";
import { handleValidationError } from "../../exeptions/handleValidationError";
import { UpdateVehicleInput } from "../../types";

export async function updateVehicle(
  request: FastifyRequest<{
    Body: UpdateVehicleInput;
  }>,
  reply: FastifyReply
) {
  const { vehicle_id: vehicleId, color, seats } = request.body;
  const ownerId = request.userData?.id;

  if (!color && seats === undefined) {
    return reply.status(400).send({
      error:
        "Pelo menos um campo (cor ou assentos) deve ser fornecido para atualização.",
    });
  }

  try {
    if (!ownerId) {
      return reply.status(400).send({
        error: "O usuaário não está logado.",
      });
    }

    const vehicle = await findVehicle(vehicleId);
    vehicleCheckOwnership(vehicle, ownerId);

    const updateData: { color?: string; seats?: number } = {};
    if (color !== undefined) updateData.color = color;
    if (seats !== undefined) updateData.seats = seats;

    const updatedVehicle = await models.vehicle.update({
      where: { vehicle_id: vehicleId },
      data: updateData,
    });

    return reply.status(200).send(sanitizeVehicle(updatedVehicle));
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
