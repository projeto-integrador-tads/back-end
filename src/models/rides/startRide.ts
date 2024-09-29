import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import {
  validateDriver,
  getRideById,
  validateRideOwnership,
  validateRideStatus,
} from "./validations/validations";
import { validateConfirmedReservations } from "../reservations/validations/validations";
import { StartRide } from "../../types";
import { handleValidationError } from "../../exeptions/handleValidationError";
import { RideStatus } from "../../utils/constants";
import { ValidationError } from "../../exeptions/validationError";
import { dayjs } from "../../utils/dayjs";

export async function startRide(
  request: FastifyRequest<{ Params: StartRide }>,
  reply: FastifyReply
) {
  const { ride_id: rideId } = request.params;
  const driverId = request.userData?.id;

  if (!driverId) {
    return reply.status(404).send("Usuário não autenticado");
  }

  try {
    const ride = await getRideById(rideId);
    await validateRideOwnership(ride, driverId);
    await validateRideStatus(ride, RideStatus.SCHEDULED);

    const now = dayjs();
    const startTime = dayjs(ride.start_time);
    if (now.isBefore(startTime)) {
      throw new ValidationError(
        "Não é possível iniciar a corrida antes do horário agendado."
      );
    }

    await validateConfirmedReservations(rideId);

    const updatedRide = await models.ride.update({
      where: { ride_id: rideId },
      data: { status: RideStatus.IN_PROGRESS },
    });

    request.server.eventBus.emit("rideStarted", updatedRide);

    return reply.status(200).send(updatedRide);
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
