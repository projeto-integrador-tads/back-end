import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { models } from "../models";
import { cancelRideSchema } from "../../utils/schemas";

type CancelRideInput = z.infer<typeof cancelRideSchema>;

export async function cancelRide(
  request: FastifyRequest<{
    Body: CancelRideInput;
  }>,
  reply: FastifyReply
) {
  const { ride_id } = request.body;
  const driver_id = request.userData?.id;

  if (!driver_id) throw new Error("Erro ao validar o id.");

  try {
    const existingRide = await models.ride.findUnique({
      where: { ride_id },
    });

    if (!existingRide) {
      return reply.status(404).send({
        error: "Corrida não encontrada.",
      });
    }

    // Verifica se a corrida já está cancelada
    if (existingRide.status === "CANCELLED") {
      return reply.status(400).send({
        error: "A corrida já está cancelada.",
      });
    }

    if (existingRide.driver_id !== driver_id) {
      return reply.status(403).send({
        error: "Você não tem permissão para cancelar esta corrida.",
      });
    }

    const updatedRide = await models.ride.update({
      where: { ride_id },
      data: {
        status: "CANCELLED",
      },
    });

    request.server.eventBus.emit("rideCancelled", updatedRide);

    return reply.status(204).send();
  } catch (error) {
    console.error("Erro ao cancelar a corrida:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
