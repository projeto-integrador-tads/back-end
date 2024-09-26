import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import {
  validateDriver,
  getRideById,
  validateRideOwnership,
  validateRideStatus,
} from "./validations/validations";
import { validateConfirmedReservations } from "../reservations/valiations/validations";
import { StartRide } from "../../types";
import { handleValidationError } from "../../exeptions/handleValidationError";

export async function startRide(
  request: FastifyRequest<{ Params: StartRide }>,
  reply: FastifyReply
) {
  const { rideId } = request.params;
  const driver_id = request.userData?.id;

  try {
    await validateDriver(driver_id);
    const ride = await getRideById(rideId);
    await validateRideOwnership(ride, driver_id!);
    await validateRideStatus(ride, "SCHEDULED");
    await validateConfirmedReservations(rideId);

    const updatedRide = await models.ride.update({
      where: { ride_id: rideId },
      data: { status: "IN_PROGRESS" },
    });

    request.server.eventBus.emit("rideStarted", updatedRide);

    return reply.status(200).send(updatedRide);
  } catch (error) {
    handleValidationError(error, reply);
    console.error("Erro ao iniciar a corrida:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
