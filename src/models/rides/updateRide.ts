import { FastifyRequest, FastifyReply } from "fastify";
import { updateRideSchema } from "../../utils/schemas";
import { z } from "zod";
import { calculateDistance } from "../../services/location/calculateDistance";
import { models } from "../models";
import { dayjs } from "../../utils/dayjs";

type UpdateRideInput = z.infer<typeof updateRideSchema>;

export async function updateRide(
  request: FastifyRequest<{
    Body: UpdateRideInput;
  }>,
  reply: FastifyReply
) {
  const {
    driver_id,
    ride_id,
    start_location,
    end_location,
    start_time,
    price,
    available_seats,
    preferences,
  } = request.body;

  try {
    // Verifica se a corrida existe
    const existingRide = await models.ride.findUnique({
      where: { ride_id },
    });

    if (!existingRide) {
      return reply.status(404).send({
        error: "Corrida não encontrada.",
      });
    }

    // Verifica se o driver_id enviado corresponde ao driver_id da corrida
    if (existingRide.driver_id !== driver_id) {
      return reply.status(403).send({
        error: "Você não tem permissão para atualizar esta corrida.",
      });
    }

    // Verifica se o horário de início é pelo menos o horário atual
    if (start_time && dayjs(start_time).isBefore(new Date())) {
      return reply.status(400).send({
        error: "O horário de saída não pode estar no passado.",
      });
    }

    // Verifica se já existe uma corrida do mesmo motorista no mesmo dia e horário
    if (start_time) {
      const conflictingRide = await models.ride.findFirst({
        where: {
          driver_id: existingRide.driver_id,
          start_time: {
            gte: dayjs(start_time).startOf("day").toDate(),
            lte: dayjs(start_time).endOf("day").toDate(),
          },
          NOT: { ride_id },
        },
      });

      if (conflictingRide) {
        return reply.status(400).send({
          error: "Você já possui uma corrida agendada no mesmo dia e horário.",
        });
      }
    }

    // Calcula a distância entre as localizações de início e fim, se fornecido
    if (start_location && end_location) {
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
    }

    // Atualiza a corrida
    const updatedRide = await models.ride.update({
      where: { ride_id },
      data: {
        start_location,
        end_location,
        start_time,
        price,
        available_seats,
        preferences,
      },
    });

    request.server.eventBus.emit("rideUpdated", updatedRide);

    return reply.status(200).send(updatedRide);
  } catch (error) {
    console.error("Erro ao atualizar a corrida:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
