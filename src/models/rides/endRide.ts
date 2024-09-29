import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import {
  validateDriver,
  getRideById,
  validateRideOwnership,
  validateRideStatus,
} from "./validations/validations";
import { EndRide } from "../../types";
import { handleValidationError } from "../../exeptions/handleValidationError";
import { RideStatus } from "../../utils/constants";
import { dayjs } from "../../utils/dayjs";

export async function endRide(
  request: FastifyRequest<{ Params: EndRide }>,
  reply: FastifyReply
) {
  const { ride_id: rideId } = request.params;
  const driver_id = request.userData?.id;

  try {
    const ride = await getRideById(rideId);
    await validateRideOwnership(ride, driver_id!);
    validateRideStatus(ride, RideStatus.IN_PROGRESS);

    const updatedRide = await models.ride.update({
      where: { ride_id: rideId },
      data: {
        status: RideStatus.COMPLETED,
        end_time: dayjs().toDate(),
      },
    });

    request.server.eventBus.emit("rideEnded", updatedRide);

    return reply.status(200).send(updatedRide);
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
