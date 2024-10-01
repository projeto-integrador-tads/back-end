import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../../models/models";
import { DeleteVehicleInput } from "../../types";
import {
  findVehicle,
  vehicleCheckOwnership,
  vehicleActive,
} from "./validation/validation";
import { handleValidationError } from "../../exeptions/handleValidationError";
import { RideStatus } from "../../utils/constants";

export const deleteVehicle = async (
  request: FastifyRequest<{ Params: DeleteVehicleInput }>,
  reply: FastifyReply
) => {
  const { vehicle_id: vehicleId } = request.params;
  const ownerId = request.userData?.id;

  if (!ownerId) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const vehicle = await findVehicle(vehicleId);
    vehicleCheckOwnership(vehicle, ownerId);
    await vehicleActive(vehicleId);

    const rides = await models.ride.findMany({
      where: { vehicle_id: vehicleId },
      select: { status: true },
    });

    const hasActiveRides = rides.some(
      (ride) => ride.status === RideStatus.IN_PROGRESS || RideStatus.SCHEDULED
    );

    if (hasActiveRides) {
      return reply.status(400).send({
        error:
          "O veículo tem corridas agendadas ou em andamento e não pode ser desativado.",
      });
    }

    await models.vehicle.update({
      where: { vehicle_id: vehicleId },
      data: { active: false },
    });

    const activeVehiclesCount = await models.vehicle.count({
      where: { owner_id: ownerId, active: true },
    });

    if (activeVehiclesCount === 0) {
      await models.user.update({
        where: { id: ownerId },
        data: { is_driver: false },
      });
    }

    return reply.status(204).send();
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
};
