import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../../models/models";
import { createReservationSchema } from "../../utils/schemas";
import { z } from "zod";
import { ValidationError } from "../../exeptions/validationError";
import {
  getRideById,
  validateRideStatus,
  validateAvailableSeats,
} from "../rides/validations/validations";
import {
  validateDriverPassenger,
  validateExistingReservation,
} from "./valiations/validations";
import { getUser } from "../users/validations/validations";
import { handleValidationError } from "../../exeptions/handleValidationError";

type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const createReservation = async (
  request: FastifyRequest<{ Params: CreateReservationInput }>,
  reply: FastifyReply
) => {
  try {
    const { rideId } = request.params;
    const passenger_id = request.userData?.id;

    if (!passenger_id) {
      throw new ValidationError("O usuário não está logado.");
    }

    await getUser(passenger_id);
    const ride = await getRideById(rideId);

    await validateRideStatus(ride, "SCHEDULED");
    await validateAvailableSeats(ride);
    await validateDriverPassenger(ride, passenger_id);
    await validateExistingReservation(rideId, passenger_id);

    const newReservation = await models.reservation.create({
      data: {
        ride_id: rideId,
        passenger_id,
        status: "PENDING",
        payment_status: "PENDING",
      },
    });

    await models.ride.update({
      where: { ride_id: rideId },
      data: { available_seats: ride.available_seats - 1 },
    });

    request.server.eventBus.emit("reservationCreated", newReservation);

    return reply.status(201).send(newReservation);
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
