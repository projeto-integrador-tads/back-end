import { ValidationError } from "../../../exeptions/validationError";
import { models } from "../../models";

export async function getReservation(reservation_id: string) {
  const reservation = await models.reservation.findUnique({
    where: { reservation_id },
  });
  if (!reservation) throw new ValidationError("Reserva não encontrada.");
  return reservation;
}

export function getReservationStatus(reservation: any) {
  if (reservation.status === "CANCELLED")
    throw new ValidationError("Você já cancelou essa reserva.");
  return reservation.status;
}

export async function validateConfirmedReservations(ride_id: string) {
  const confirmedReservations = await models.reservation.count({
    where: { ride_id: ride_id, status: "CONFIRMED" },
  });

  if (confirmedReservations === 0) {
    throw new ValidationError(
      "A corrida deve ter pelo menos uma reserva confirmada para ser iniciada."
    );
  }
}

export async function validateDriverPassenger(ride: any, passenger_id: string) {
  if (ride.driver_id === passenger_id) {
    throw new ValidationError(
      "Não é possível pegar carona em uma corrida criada por você."
    );
  }
}

export async function validateExistingReservation(
  rideId: string,
  passenger_id: string
) {
  const existingReservation = await models.reservation.findFirst({
    where: {
      ride_id: rideId,
      passenger_id,
      status: { not: "CANCELLED" },
    },
  });

  if (existingReservation) {
    throw new ValidationError(
      "Você já possui uma reserva ativa ou pendente para esta corrida."
    );
  }
}
