import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { ValidationError } from "../../exeptions/validationError";
import { handleValidationError } from "../../exeptions/handleValidationError";
import { getUser } from "../users/validations/validations";
import {
  getRideById,
  validateRideStatus,
} from "../rides/validations/validations";
import {
  getReservation,
  getReservationStatus,
} from "./validations/validations";
import { ConfirmReservationInput } from "../../types";
import {
  ReservationStatus,
  PaymentStatus,
  RideStatus,
  eventTypes,
} from "../../utils/constants";

export async function confirmReservation(
  request: FastifyRequest<{ Params: ConfirmReservationInput }>,
  reply: FastifyReply
) {
  try {
    const { reservation_id: reservationId } = request.params;
    const passengerId = request.userData?.id;

    if (!passengerId) {
      throw new ValidationError("O usuário não está logado.");
    }

    await getUser(passengerId);
    const reservation = await getReservation(reservationId);
    getReservationStatus(reservation);

    if (reservation.passenger_id !== passengerId) {
      throw new ValidationError(
        "Você não tem permissão para confirmar esta reserva."
      );
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new ValidationError(
        "Esta reserva não está pendente de confirmação."
      );
    }

    const ride = await getRideById(reservation.ride_id);
    validateRideStatus(ride, RideStatus.SCHEDULED);

    if (ride.available_seats <= 0) {
      throw new ValidationError(
        "Não há mais assentos disponíveis para esta corrida."
      );
    }

    const updatedReservation = await models.reservation.update({
      where: { reservation_id: reservationId },
      data: {
        status: ReservationStatus.CONFIRMED,
        payment_status: PaymentStatus.PAID,
      },
    });

    request.server.eventBus.emit(
      eventTypes.reservationConfirmed,
      updatedReservation
    );

    return reply.status(200).send({
      message: "Reserva confirmada com sucesso.",
      reservation: updatedReservation,
    });
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
