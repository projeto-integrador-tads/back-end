import { ValidationError } from "../../../exeptions/validationError";
import { sanitizeVehicle } from "../../../utils/sanitize";
import { models } from "../../models";

export const vehicleValidation = (vehicleId: string) => {
  const validations: Promise<void>[] = [];
  let vehicle: any = null;

  const validate = {
    exists: () => {
      validations.push(
        (async () => {
          vehicle = await models.vehicle.findUnique({ where: { vehicle_id: vehicleId } });
          if (!vehicle) {
            throw new ValidationError("O veículo não existe.");
          }
        })()
      );
      return validate;
    },
    isActive: () => {
      validations.push(
        (async () => {
          if (!vehicle.active) {
            throw new ValidationError("O veículo está inativo.");
          }
        })()
      );
      return validate;
    },
    belongsToUser: (userId: string) => {
      validations.push(
        (async () => {
          if (vehicle.owner_id !== userId) {
            throw new ValidationError("O veículo não pertence ao usuário.");
          }
        })()
      );
      return validate;
    },
    validate: async () => {
      await Promise.all(validations);
      return sanitizeVehicle(vehicle);
    }
  };

  return validate;
};