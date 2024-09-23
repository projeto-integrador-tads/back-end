import { ValidationError } from "../../../exeptions/validationError";
import { sanitizeUser } from "../../../utils/sanitize";
import { models } from "../../models";

export const userValidation = (userId: string) => {
  const validations: Promise<void>[] = [];
  let user: any = null;

  const validate = {
    isActive: () => {
      validations.push(
        (async () => {
          user = await models.user.findUnique({ where: { id: userId } });
          if (!user || !user.active) {
            throw new ValidationError("O usuário está inativo.");
          }
        })()
      );
      return validate;
    },
    isDriver: () => {
      validations.push(
        (async () => {
          const user = await models.user.findUnique({ where: { id: userId } });
          if (!user || !user.is_driver) {
            throw new ValidationError("O usuário não é um motorista.");
          }
        })()
      );
      return validate;
    },
    ownsCar: (carId: string) => {
      validations.push(
        (async () => {
          const car = await models.vehicle.findUnique({ where: { vehicle_id: carId, owner_id: userId } });
          if (!car) {
            throw new ValidationError("O usuário não possui o carro.");
          }
        })()
      );
      return validate;
    },
    ownsRide: (rideId: string) => {
      validations.push(
        (async () => {
          const ride = await models.ride.findUnique({ where: { ride_id: rideId, driver_id: userId } });
          if (!ride) {
            throw new ValidationError("O usuário não possui a corrida.");
          }
        })()
      );
      return validate;
    },
    hasConfirmedReservation: (rideId: string) => {
      validations.push(
        (async () => {
          const reservation = await models.reservation.findFirst({
            where: { ride_id: rideId, passenger_id: userId, status: "CONFIRMED" }
          });
          if (!reservation) {
            throw new ValidationError("O usuário não tem uma reserva confirmada para esta corrida.");
          }
        })()
      );
      return validate;
    },
    hasPendingReservation: (rideId: string) => {
      validations.push(
        (async () => {
          const reservation = await models.reservation.findFirst({
            where: { ride_id: rideId, passenger_id: userId, status: "PENDING" }
          });
          if (!reservation) {
            throw new ValidationError("O usuário não tem uma reserva pendente para esta corrida.");
          }
        })()
      );
      return validate;
    },
    isOnRide: (rideId: string) => {
      validations.push(
        (async () => {
          const ride = await models.ride.findFirst({
            where: { ride_id: rideId, driver_id: userId, status: "IN_PROGRESS" }
          });
          if (!ride) {
            throw new ValidationError("O usuário não está na corrida.");
          }
        })()
      );
      return validate;
    },
    validate: async () => {
      await Promise.all(validations);
      return sanitizeUser(user);
    }
  };

  return validate;
};