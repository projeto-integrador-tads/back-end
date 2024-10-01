import { models } from "../../models";
import { ReservationStatus, RideStatus } from "../../../utils/constants";
import { ValidationError } from "../../../exeptions/validationError";

export async function validateRide(ride_id: string) {
  const ride = await models.ride.findUnique({
    where: { ride_id },
    include: { Reservations: true },
  });

  if (!ride || ride.status === RideStatus.COMPLETED) {
    throw new ValidationError("Corrida não encontrada ou já finalizada.");
  }

  return ride;
}

export function validateParticipants(
  ride: any,
  sender_id: string,
  receiver_id: string
) {
  const isDriver = ride.driver_id === sender_id;
  const isPassenger = ride.Reservations.some(
    (res: any) =>
      res.passenger_id === sender_id &&
      (res.status === ReservationStatus.PENDING ||
        res.status === ReservationStatus.CONFIRMED)
  );

  if (!isDriver && !isPassenger) {
    throw new ValidationError(
      "Você não tem permissão para enviar mensagens nesta corrida."
    );
  }

  const isReceiverDriver = ride.driver_id === receiver_id;
  const isReceiverPassenger = ride.Reservations.some(
    (res: any) =>
      res.passenger_id === receiver_id &&
      (res.status === ReservationStatus.PENDING ||
        res.status === ReservationStatus.CONFIRMED)
  );

  if (!isReceiverDriver && !isReceiverPassenger) {
    throw new ValidationError("Destinatário inválido.");
  }
}
