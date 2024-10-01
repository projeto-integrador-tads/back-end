import { dayjs } from "../../../utils/dayjs";
import { ValidationError } from "../../../exeptions/validationError";
import { models } from "../../models";
import { calculateDistance } from "../../../services/location/calculateDistance";
import { Ride } from "@prisma/client";

export async function validateDriver(driver_id: string | undefined) {
  if (!driver_id) {
    throw new ValidationError("Usuário não autenticado.");
  }
  const user = await models.user.findUnique({ where: { id: driver_id } });
  if (!user || !user.active || !user.is_driver) {
    throw new ValidationError("Usuário inválido ou não é um motorista ativo.");
  }
}

export async function getRideById(ride_id: string) {
  const ride = await models.ride.findUnique({ where: { ride_id } });
  if (!ride) {
    throw new ValidationError("Corrida não encontrada.");
  }
  return ride;
}

export async function validateRideOwnership(ride: Ride, driver_id: string) {
  if (ride.driver_id !== driver_id) {
    throw new ValidationError(
      "Você não tem permissão para atualizar esta corrida."
    );
  }
}

export async function validateVehicle(vehicle_id: string, driver_id: string) {
  const vehicle = await models.vehicle.findUnique({ where: { vehicle_id } });
  if (!vehicle) {
    throw new ValidationError("Veículo não encontrado.");
  }
  if (!vehicle.active) {
    throw new ValidationError("O veículo está inativo.");
  }
  if (vehicle.owner_id !== driver_id) {
    throw new ValidationError("O veículo não pertence ao usuário.");
  }
}

export function validateStartTime(start_time: Date) {
  const now = dayjs().format();
  if (dayjs(start_time).isBefore(now)) {
    throw new ValidationError("O horário de saída não pode estar no passado.");
  }
}

export async function validateAddresses(
  start_location_id: string | undefined,
  end_location_id: string | undefined,
  start_location: string | undefined,
  end_location: string | undefined
) {
  if (!start_location_id && !start_location) {
    throw new ValidationError(
      "O local de partida deve ter um ID ou um endereço."
    );
  }

  if (!end_location_id && !end_location) {
    throw new ValidationError(
      "O local de destino deve ter um ID ou um endereço."
    );
  }
}

export async function validateDistance(startAddress: any, endAddress: any) {
  const distanceResult = await calculateDistance(
    startAddress.formattedAddress,
    endAddress.formattedAddress
  );
  if (!distanceResult || distanceResult.distance < 500) {
    throw new ValidationError(
      "A distância entre o ponto de partida e o ponto de chegada deve ser de pelo menos 500 metros."
    );
  }
}

export function validateRideStatus(ride: Ride, expectedStatus: string) {
  if (ride.status !== expectedStatus) {
    throw new ValidationError(
      `Apenas corridas ${expectedStatus} podem ser processadas.`
    );
  }
}

export async function validateAvailableSeats(ride: Ride) {
  if (ride.available_seats <= 0) {
    throw new ValidationError("Não há assentos disponíveis.");
  }
}
