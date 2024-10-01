import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { dayjs } from "../../utils/dayjs";
import { getOrCreateAddress } from "../addresses/getOrCreateAddress";
import {
  validateDriver,
  validateVehicle,
  validateStartTime,
  validateDistance,
} from "./validations/validations";
import { handleValidationError } from "../../exeptions/handleValidationError";
import { CreateRideInput, NewRideType } from "../../types";
import { RideStatus, eventTypes } from "../../utils/constants";

export async function createRide(
  request: FastifyRequest<{
    Body: CreateRideInput;
  }>,
  reply: FastifyReply
) {
  const {
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

  const userId = request.userData?.id;

  if (!userId) {
    return reply.status(400).send({
      error: "O usuário não está logado.",
    });
  }

  try {
    await validateDriver(userId);
    await validateVehicle(vehicle_id, userId);
    validateStartTime(start_time);

    const existingRide = await models.ride.findFirst({
      where: {
        driver_id: userId,
        start_time: {
          gte: dayjs(start_time).subtract(2, "hours").toDate(),
          lte: dayjs(start_time).add(2, "hours").toDate(),
        },
      },
    });

    if (existingRide) {
      return reply.status(400).send({
        error:
          "Você já possui uma corrida agendada dentro de um intervalo de 2 horas.",
      });
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

    if (!startAddress || !endAddress) {
      return reply.status(400).send({
        error: "Endereços de partida e/ou destino não encontrados.",
      });
    }

    await validateDistance(startAddress, endAddress);

    const newRide: NewRideType = await models.ride.create({
      data: {
        driver_id: userId,
        vehicle_id,
        start_address_id: startAddress.id,
        end_address_id: endAddress.id,
        start_time,
        price,
        available_seats,
        preferences,
        status: RideStatus.SCHEDULED,
      },
      include: {
        StartAddress: true,
        Driver: {
          select: {
            name: true,
            last_name: true,
            email: true,
          },
        },
        EndAddress: true,
      },
    });

    request.server.eventBus.emit(eventTypes.rideCreated, newRide);

    return reply.status(201).send(newRide);
  } catch (error) {
    handleValidationError(error, reply);
    if (error instanceof Error) {
      return reply.status(400).send({ error: error.message });
    }
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
