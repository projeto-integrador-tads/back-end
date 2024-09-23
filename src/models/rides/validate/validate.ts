import { ValidationError } from "../../../exeptions/validationError";
import { sanitizeAddress, sanitizeRide } from "../../../utils/sanitize";
import { models } from "../../models";

export const rideValidation = (rideId: string) => {
  const validations: Promise<void>[] = [];
  let ride: any = null;

  const validate = {
    exists: () => {
      validations.push(
        (async () => {
          ride = await models.ride.findUnique({ where: { ride_id: rideId } });
          if (!ride) {
            throw new ValidationError("A corrida não existe.");
          }
        })()
      );
      return validate;
    },
    isNotCancelled: () => {
      validations.push(
        (async () => {
          if (ride.status === "CANCELLED") {
            throw new ValidationError("A corrida já está cancelada.");
          }
        })()
      );
      return validate;
    },
    belongsToDriver: (driverId: string) => {
      validations.push(
        (async () => {
          if (ride.driver_id !== driverId) {
            throw new ValidationError("A corrida não pertence a este motorista.");
          }
        })()
      );
      return validate;
    },
    hasAvailableSeats: () => {
      validations.push(
        (async () => {
          if (ride.available_seats <= 0) {
            throw new ValidationError("A corrida não tem assentos disponíveis.");
          }
        })()
      );
      return validate;
    },
    validate: async () => {
      await Promise.all(validations);
      return sanitizeRide(ride);
    }
  };

  return validate;
};