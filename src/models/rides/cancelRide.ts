import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { CancelRideInput } from "../../types";
import { ValidationError } from "../../exeptions/validationError";
import { handleValidationError } from "../../exeptions/handleValidationError";
import {
  validateDriver,
  getRideById,
  validateRideOwnership,
  validateRideStatus,
} from "./validations/validations";
import { RideStatus } from "../../utils/constants";

export async function cancelRide(
  request: FastifyRequest<{
    Params: CancelRideInput;
  }>,
  reply: FastifyReply
) {
  const { ride_id: rideId } = request.params;
  const driverId = request.userData?.id;

  if (!driverId) {
    throw new ValidationError("Usuário não autenticado.");
  }

  try {
    await validateDriver(driverId);
    const ride = await getRideById(rideId);
    await validateRideOwnership(ride, driverId);
    validateRideStatus(ride, RideStatus.SCHEDULED);

    const updatedRide = await models.ride.update({
      where: { ride_id: rideId },
      data: {
        status: RideStatus.CANCELLED,
      },
    });

    request.server.eventBus.emit("rideCancelled", updatedRide);

    return reply.status(204).send();
  } catch (error) {
    handleValidationError(error, reply);
    console.error("Erro ao cancelar a corrida:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
