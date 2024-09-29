import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { sanitizeRide } from "../../utils/sanitize";
import { getOrCreateAddress } from "../addresses/getOrCreateAddress";
import {
  validateDriver,
  getRideById,
  validateRideOwnership,
  validateVehicle,
  validateStartTime,
  validateDistance,
} from "./validations/validations";
import { handleValidationError } from "../../exeptions/handleValidationError";
import { UpdateRideInput } from "../../types";
import { eventTypes } from "../../utils/constants";

export async function updateRide(
  request: FastifyRequest<{
    Body: UpdateRideInput;
  }>,
  reply: FastifyReply
) {
  const {
    ride_id,
    vehicle_id,
    start_location_id,
    end_location_id,
    start_latitude,
    start_longitude,
    end_latitude,
    end_longitude,
    start_time,
    price,
    available_seats,
    preferences,
  } = request.body;

  const driverId = request.userData?.id;

  if (!driverId) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    await validateDriver(driverId);
    const existingRide = await getRideById(ride_id);
    await validateRideOwnership(existingRide, driverId);

    if (vehicle_id) {
      await validateVehicle(vehicle_id, driverId);
    }

    if (start_time) {
      validateStartTime(start_time);
    }

    const startAddress = await getOrCreateAddress(
      start_location_id,
      start_latitude,
      start_longitude
    );
    const endAddress = await getOrCreateAddress(
      end_location_id,
      end_latitude,
      end_longitude
    );

    if (startAddress && endAddress) {
      await validateDistance(startAddress, endAddress);
    }

    const updateData: any = {};
    if (vehicle_id) updateData.vehicle_id = vehicle_id;
    if (startAddress) updateData.start_address_id = startAddress.id;
    if (endAddress) updateData.end_address_id = endAddress.id;
    if (start_time) updateData.start_time = start_time;
    if (price) updateData.price = price;
    if (available_seats) updateData.available_seats = available_seats;
    if (preferences) updateData.preferences = preferences;

    const updatedRide = await models.ride.update({
      where: { ride_id },
      data: updateData,
    });

    request.server.eventBus.emit(eventTypes.rideUpdated, updatedRide);

    return reply.status(200).send(sanitizeRide(updatedRide));
  } catch (error) {
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
}
