import { Vehicle } from "@prisma/client";
import { ValidationError } from "../../../exeptions/validationError";
import { models } from "../../models";

export async function findVehicle(vehicle_id: string) {
  const vehicle = await models.vehicle.findUnique({ where: { vehicle_id } });
  if (!vehicle) {
    throw new ValidationError("Veículo não encontrado.");
  }
  return vehicle;
}

export function vehicleCheckOwnership(vehicle: Vehicle, driverId: string) {
  if (vehicle.owner_id !== driverId) {
    throw new ValidationError("O veículo não pertence ao usuário.");
  }
}

export async function vehicleActive(vehicleId: string) {
  const vehicle = await findVehicle(vehicleId);
  if (!vehicle.active) {
    throw new ValidationError("O veículo está inativo.");
  }
  return vehicle;
}
