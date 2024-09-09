import { Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../../models/models";

export const deleteVehicle = async (
  request: FastifyRequest<{ Params: { vehicle_id: string } }>,
  response: FastifyReply
) => {
  const { vehicle_id } = request.params;

  try {
    // Verifica o status atual do veículo
    const vehicle = await models.vehicle.findUnique({
      where: { vehicle_id },
      select: { active: true },
    });

    if (!vehicle) {
      return response.status(404).send({ error: "Veículo não encontrado." });
    }

    if (!vehicle.active) {
      return response
        .status(400)
        .send({ error: "O veículo já está desativado." });
    }

    // Verifica se há corridas associadas ao veículo
    const rides = await models.ride.findMany({
      where: { vehicle_id },
      select: { status: true },
    });

    // Se houver corridas com status que impede a desativação (por exemplo, em progresso)
    const hasActiveRides = rides.some(
      (ride) => ride.status === "IN_PROGRESS" || ride.status === "SCHEDULED"
    );

    if (hasActiveRides) {
      return response
        .status(400)
        .send({
          error:
            "O veículo tem corridas agendadas ou em andamento e não pode ser desativado.",
        });
    }

    // Atualiza o status do veículo para inativo
    await models.vehicle.update({
      where: { vehicle_id },
      data: { active: false },
    });

    return response.status(204).send();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return response.status(404).send({ error: "Veículo não encontrado." });
    }
    return response.status(500).send({ error: "Erro interno do servidor." });
  }
};
