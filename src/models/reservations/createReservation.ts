import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../../models/models";
import { ValidationError } from "../../exeptions/validationError";
import {
  getRideById,
  validateRideStatus,
  validateAvailableSeats,
} from "../rides/validations/validations";
import {
  validateDriverPassenger,
  validateExistingReservation,
} from "./validations/validations";
import { getUser } from "../users/validations/validations";
import { handleValidationError } from "../../exeptions/handleValidationError";
import { CreateReservationInput } from "../../types";
import {
  PaymentStatus,
  ReservationStatus,
  RideStatus,
} from "../../utils/constants";

export async function createReservation(
  request: FastifyRequest<{ Params: CreateReservationInput }>,
  reply: FastifyReply
) {
  try {
    const { ride_id: rideId } = request.params;
    const passengerId = request.userData?.id;

    if (!passengerId) {
      throw new ValidationError("O usuário não está logado.");
    }

    await getUser(passengerId);
    const ride = await getRideById(rideId);

    await validateRideStatus(ride, RideStatus.SCHEDULED);
    await validateAvailableSeats(ride);
    await validateDriverPassenger(ride, passengerId);
    await validateExistingReservation(rideId, passengerId);

    const newReservation = await models.reservation.create({
      data: {
        ride_id: rideId,
        passenger_id: passengerId,
        status: ReservationStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
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
}
