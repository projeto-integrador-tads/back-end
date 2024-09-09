import { FastifyReply, FastifyRequest } from "fastify";
import { models } from "../../models/models";
import { createReservationSchema } from "../../utils/schemas";
import { z } from "zod";
import { Prisma } from "@prisma/client";
type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const createReservation = async (
  request: FastifyRequest<{ Body: CreateReservationInput }>,
  reply: FastifyReply
) => {
  try {
    const { ride_id } = request.body;
    const passenger_id = request.userData?.id;

    if (!passenger_id) {
      throw new Error("User ID is missing.");
    }

    // Verificar se a carona existe
    const ride = await models.ride.findUnique({
      where: { ride_id },
    });

    if (!ride) {
      return reply.status(404).send({ error: "Corrida não encontrada." });
    }

    // Verifica se o usuário existe
    const passenger = await models.user.findUnique({
      where: { id: passenger_id },
    });

    if (!passenger) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    // verifica se o usuário está ativo no sistema
    if (!passenger.active) {
      return reply.status(400).send({
        error: "O usuário está inativo.",
      });
    }

    // Verificar se há assentos disponíveis
    if (ride.available_seats <= 0) {
      return reply.status(400).send({ error: "Não há assentos disponíveis." });
    }

    // Verifica se o motorista é diferente do passageiro
    if (ride.driver_id === passenger_id) {
      return reply.status(400).send({
        error: "Não é possível pegar carona em uma corrida criada por você.",
      });
    }

    // Verificar se já existe uma reserva ativa ou pendente para o mesmo usuário e corrida
    try {
      const existingReservation = await models.reservation.findFirst({
        where: {
          ride_id,
          passenger_id,
          status: { not: "CANCELLED" },
        },
      });

      console.log("Existing Reservation:", existingReservation);

      if (existingReservation) {
        return reply.status(400).send({
          error:
            "Você já possui uma reserva ativa ou pendente para esta corrida.",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar reserva existente:", error);
      return reply
        .status(500)
        .send({ error: "Erro ao verificar reserva existente." });
    }

    // Criar a reserva
    const newReservation = await models.reservation.create({
      data: {
        ride_id,
        passenger_id,
        status: "PENDING",
        payment_status: "PENDING",
      },
    });

    // Atualizar o número de assentos disponíveis na carona
    await models.ride.update({
      where: { ride_id },
      data: { available_seats: ride.available_seats - 1 },
    });

    return reply.status(201).send(newReservation);
  } catch (error) {
    console.error("Erro ao criar a reserva:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
};
