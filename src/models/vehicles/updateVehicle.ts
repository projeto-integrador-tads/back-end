import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { z } from "zod";
import { updateVehicleSchema } from "../../utils/schemas";
import { sanitizeVehicle } from "../../utils/sanitize";

type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

export async function updateVehicle(
  request: FastifyRequest<{
    Body: UpdateVehicleInput;
  }>,
  reply: FastifyReply
) {
  const { vehicle_id, color, seats } = request.body;
  const owner_id = request.userData?.id;

  if (!color && seats === undefined) {
    return reply
      .status(400)
      .send({
        error:
          "Pelo menos um campo (cor ou assentos) deve ser fornecido para atualização.",
      });
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
        .send({ error: "Você não tem permissão para atualizar este veículo." });
    }

    const updateData: { color?: string; seats?: number } = {};
    if (color !== undefined) updateData.color = color;
    if (seats !== undefined) updateData.seats = seats;

    const updatedVehicle = await models.vehicle.update({
      where: { vehicle_id },
      data: updateData,
    });

    return reply.status(200).send(sanitizeVehicle(updatedVehicle));
  } catch (error) {
    console.error("Erro ao atualizar o veículo:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
