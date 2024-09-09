import { FastifyRequest, FastifyReply } from "fastify";
import { updateRideSchema } from "../../utils/schemas";
import { z } from "zod";
import { calculateDistance } from "../../services/location/calculateDistance";
import { models } from "../models";
import { dayjs } from "../../utils/dayjs";
import { geocodeAddress } from "../../services/location/geocodeAddress";

type UpdateRideInput = z.infer<typeof updateRideSchema>;

export async function updateRide(
  request: FastifyRequest<{
    Body: UpdateRideInput;
  }>,
  reply: FastifyReply
) {
  const {
    ride_id,
    vehicle_id,
    start_location,
    end_location,
    start_location_id,
    end_location_id,
    start_time,
    price,
    available_seats,
    preferences,
  } = request.body;

  const driver_id = request.userData?.id;
  if (!driver_id) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const existingRide = await models.ride.findUnique({
      where: { ride_id },
    });

    if (!existingRide) {
      return reply.status(404).send({ error: "Corrida não encontrada." });
    }

    if (existingRide.driver_id !== driver_id) {
      return reply.status(403).send({
        error: "Você não tem permissão para atualizar esta corrida.",
      });
    }

    // Verifica o status do veículo apenas se o vehicle_id for fornecido
    if (vehicle_id) {
      const vehicle = await models.vehicle.findUnique({
        where: { vehicle_id },
      });

      if (!vehicle) {
        return reply.status(404).send({ error: "Veículo não encontrado." });
      }

      if (!vehicle.active) {
        return reply.status(400).send({
          error: "O veículo está inativo.",
        });
      }
    }

    const updateData: Record<string, any> = {};

    if (start_time && dayjs(start_time).isBefore(new Date())) {
      return reply.status(400).send({
        error: "O horário de saída não pode estar no passado.",
      });
    }

    if (start_time) updateData.start_time = start_time;
    if (price) updateData.price = price;
    if (available_seats) updateData.available_seats = available_seats;
    if (preferences) updateData.preferences = preferences;

    let startAddress, endAddress;

    if (start_location_id) {
      startAddress = await models.address.findUnique({
        where: { id: start_location_id },
      });

      if (startAddress) {
        updateData.start_address_id = startAddress.id;
      }
    }

    if (start_location) {
      if (!startAddress) {
        startAddress = await geocodeAddress(start_location);
        if (!startAddress) {
          return reply.status(400).send({
            error: "Não foi possível geocodificar o endereço de partida.",
          });
        }

        const newStartAddress = await models.address.create({
          data: {
            latitude: startAddress.lat,
            longitude: startAddress.lng,
            city: startAddress.city,
            formattedAddress: startAddress.formattedAddress,
          },
        });
        updateData.start_address_id = newStartAddress.id;
      } else {
        await models.address.update({
          where: { id: startAddress.id },
          data: {
            latitude: startAddress.latitude,
            longitude: startAddress.longitude,
            city: startAddress.city,
            formattedAddress: startAddress.formattedAddress,
          },
        });
        updateData.start_address_id = startAddress.id;
      }
    }

    if (end_location_id) {
      endAddress = await models.address.findUnique({
        where: { id: end_location_id },
      });

      if (endAddress) {
        updateData.end_address_id = endAddress.id;
      }
    }

    if (end_location) {
      if (!endAddress) {
        endAddress = await geocodeAddress(end_location);
        if (!endAddress) {
          return reply.status(400).send({
            error: "Não foi possível geocodificar o endereço de destino.",
          });
        }

        const newEndAddress = await models.address.create({
          data: {
            latitude: endAddress.lat,
            longitude: endAddress.lng,
            city: endAddress.city,
            formattedAddress: endAddress.formattedAddress,
          },
        });
        updateData.end_address_id = newEndAddress.id;
      } else {
        await models.address.update({
          where: { id: endAddress.id },
          data: {
            latitude: endAddress.latitude,
            longitude: endAddress.longitude,
            city: endAddress.city,
            formattedAddress: endAddress.formattedAddress,
          },
        });
        updateData.end_address_id = endAddress.id;
      }
    }

    if (startAddress && endAddress) {
      const distanceResult = await calculateDistance(
        startAddress.formattedAddress,
        endAddress.formattedAddress
      );

      if (!distanceResult || distanceResult.distance < 500) {
        return reply.status(400).send({
          error:
            "A distância entre o ponto de partida e o ponto de chegada deve ser de pelo menos 500 metros.",
        });
      }
    }

    const updatedRide = await models.ride.update({
      where: { ride_id },
      data: updateData,
    });

    request.server.eventBus.emit("rideUpdated", updatedRide);

    return reply.status(200).send(updatedRide);
  } catch (error) {
    console.error("Erro ao atualizar a corrida:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
