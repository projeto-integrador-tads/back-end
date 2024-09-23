import { Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../../models/models";

export const deleteVehicle = async (
  request: FastifyRequest<{ Params: { vehicle_id: string } }>,
  response: FastifyReply
) => {
  const { vehicle_id } = request.params;
  const owner_id = request.userData?.id;

  if (!owner_id) {
    return response.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const vehicle = await models.vehicle.findUnique({
      where: { vehicle_id },
      select: { active: true, owner_id: true },
    });

    if (!vehicle) {
      return response.status(404).send({ error: "Veículo não encontrado." });
    }

    if (vehicle.owner_id !== owner_id) {
      return response
        .status(403)
        .send({ error: "Você não tem permissão para desativar este veículo." });
    }

    if (!vehicle.active) {
      return response
        .status(400)
        .send({ error: "O veículo já está desativado." });
    }

    const rides = await models.ride.findMany({
      where: { vehicle_id },
      select: { status: true },
    });

    const hasActiveRides = rides.some(
      (ride) => ride.status === "IN_PROGRESS" || ride.status === "SCHEDULED"
    );

    if (hasActiveRides) {
      return response.status(400).send({
        error:
          "O veículo tem corridas agendadas ou em andamento e não pode ser desativado.",
      });
    }

    await models.vehicle.update({
      where: { vehicle_id },
      data: { active: false },
    });

    // Check if this was the user's last active vehicle
    const activeVehiclesCount = await models.vehicle.count({
      where: { owner_id, active: true },
    });

    if (activeVehiclesCount === 0) {
      await models.user.update({
        where: { id: owner_id },
        data: { is_driver: false },
      });
    }

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
