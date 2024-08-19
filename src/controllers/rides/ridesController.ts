import { FastifyRequest, FastifyReply } from "fastify";
import { createRideSchema } from "../../utils/schemas";
import { z } from "zod";
import dayjs from "dayjs";
import { calculateDistance } from "../../services/location/calculateDistance";
import { models } from "../../models/models";

type CreateRideInput = z.infer<typeof createRideSchema>;

export async function createRideHandler(
  request: FastifyRequest<{
    Body: CreateRideInput;
  }>,
  reply: FastifyReply
) {
  const {
    user_id,
    vehicle_id,
    start_location,
    end_location,
    start_time,
    price,
    available_seats,
    preferences,
  } = request.body;

  try {
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

    // Verifica se o usuário possui pelo menos um veículo
    const userVehicles = await models.vehicle.findMany({
      where: { owner_id: user_id },
    });

    if (userVehicles.length === 0) {
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

    // Verifica se o horário de início é pelo menos o horário atual
    if (dayjs(start_time).isBefore(new Date())) {
      return reply.status(400).send({
        error: "O horário de saída não pode estar no passado.",
      });
    }

    // Calcula a distância entre as localizações de início e fim
    const distanceResult = await calculateDistance(
      start_location,
      end_location
    );
    if (!distanceResult) {
      return reply.status(400).send({
        error:
          "Não foi possível calcular a distância entre as duas localizações.",
      });
    }

    if (distanceResult.distance < 500) {
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
        start_location,
        end_location,
        start_time,
        price,
        available_seats,
        preferences,
        status: "SCHEDULED",
      },
    });

    return reply.status(201).send(newRide);
  } catch (error) {
    console.error("Erro ao criar a corrida:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
