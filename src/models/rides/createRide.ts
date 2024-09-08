import { FastifyRequest, FastifyReply } from "fastify";
import { createRideSchema } from "../../utils/schemas";
import { z } from "zod";
import { calculateDistance } from "../../services/location/calculateDistance";
import { models } from "../models";
import { dayjs } from "../../utils/dayjs";
import { geocodeAddress } from "../../services/location/geocodeAddress";

type CreateRideInput = z.infer<typeof createRideSchema>;

export async function createRide(
  request: FastifyRequest<{
    Body: CreateRideInput;
  }>,
  reply: FastifyReply
) {
  const {
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

  const user_id = request.userData?.id;

  if (!user_id) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  // Verifica se pelo menos um ID ou endereço foi fornecido para cada localização
  if (!start_location_id && !start_location) {
    return reply.status(400).send({
      error: "O local de partida deve ter um ID ou um endereço.",
    });
  }

  if (!end_location_id && !end_location) {
    return reply.status(400).send({
      error: "O local de destino deve ter um ID ou um endereço.",
    });
  }

  try {
    // Verifica a existência do usuário
    const user = await models.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return reply.status(400).send({
        error: "Usuário não encontrado.",
      });
    }

    if (!user.active) {
      return reply.status(400).send({
        error: "O usuário está inativo.",
      });
    }

    if (!user.is_driver) {
      return reply.status(400).send({
        error: "Não é possível criar uma corrida sem um veículo.",
      });
    }

    // Verifica se o id do veículo pertence ao usuário
    const vehicle = await models.vehicle.findUnique({
      where: { vehicle_id, owner_id: user_id },
    });

    if (!vehicle) {
      return reply.status(400).send({
        error: "O id do veículo não pertence ao usuário.",
      });
    }

    if (!vehicle.active) {
      return reply.status(400).send({
        error: "O veículo está inativo.",
      });
    }

    // Verifica se o horário de início é pelo menos o horário atual
    if (dayjs(start_time).add(2, "hours").isBefore(new Date())) {
      return reply.status(400).send({
        error: "O horário de saída não pode estar no passado.",
      });
    }

    // Verifica se já existe uma corrida do mesmo motorista no mesmo dia e horário
    const existingRide = await models.ride.findFirst({
      where: {
        driver_id: user_id,
        start_time: {
          gte: dayjs(start_time).startOf("day").toDate(),
          lte: dayjs(start_time).endOf("day").toDate(),
        },
      },
    });

    if (existingRide) {
      return reply.status(400).send({
        error: "Você já possui uma corrida agendada no mesmo dia e horário.",
      });
    }

    let startAddress;
    let endAddress;

    if (start_location_id) {
      startAddress = await models.address.findUnique({
        where: { id: start_location_id },
      });

      if (!startAddress) {
        return reply.status(400).send({
          error: "O ID do endereço de partida não é válido.",
        });
      }
    }

    if (end_location_id) {
      endAddress = await models.address.findUnique({
        where: { id: end_location_id },
      });

      if (!endAddress) {
        return reply.status(400).send({
          error: "O ID do endereço de destino não é válido.",
        });
      }
    }

    if (!startAddress && start_location) {
      startAddress = await geocodeAddress(start_location);

      if (!startAddress) {
        return reply.status(400).send({
          error: "Não foi possível geocodificar o endereço de partida.",
        });
      }

      // Cria um novo endereço se não existir
      startAddress = await models.address.create({
        data: {
          latitude: startAddress.lat,
          longitude: startAddress.lng,
          city: startAddress.city,
          formattedAddress: startAddress.formattedAddress,
        },
      });
    }

    if (!endAddress && end_location) {
      endAddress = await geocodeAddress(end_location);

      if (!endAddress) {
        return reply.status(400).send({
          error: "Não foi possível geocodificar o endereço de destino.",
        });
      }

      // Cria um novo endereço se não existir
      endAddress = await models.address.create({
        data: {
          latitude: endAddress.lat,
          longitude: endAddress.lng,
          city: endAddress.city,
          formattedAddress: endAddress.formattedAddress,
        },
      });
    }

    if (!startAddress || !endAddress) {
      return reply.status(400).send({
        error: "Endereços de partida e/ou destino não encontrados.",
      });
    }

    // Calcula a distância entre as localizações de início e fim
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

    // Cria a corrida
    const newRide = await models.ride.create({
      data: {
        driver_id: user_id,
        vehicle_id,
        start_address_id: startAddress.id,
        end_address_id: endAddress.id,
        start_time,
        price,
        available_seats,
        preferences,
        status: "SCHEDULED",
      },
    });

    request.server.eventBus.emit("rideCreated", {
      name: user.name,
      email: user.email,
      start_location: startAddress.formattedAddress,
      end_location: endAddress.formattedAddress,
      start_time,
      price,
      available_seats,
      preferences,
    });

    return reply.status(201).send(newRide);
  } catch (error) {
    console.error("Erro ao criar a corrida:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
