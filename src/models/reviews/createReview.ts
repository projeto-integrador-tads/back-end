import { FastifyRequest, FastifyReply } from "fastify";
import { createReviewSchema } from "../../utils/schemas";
import { models } from "../models";

type CreateReviewBody = typeof createReviewSchema._type;

export async function createReview(
  request: FastifyRequest<{
    Body: CreateReviewBody;
  }>,
  reply: FastifyReply
) {
  const { ride_id, rating, comment } = request.body;
  const reviewer_id = request.userData?.id;

  if (!reviewer_id) {
    return reply.status(400).send({ error: "ID do avaliador não encontrado." });
  }

  try {
    // Verifica se a corrida existe
    const ride = await models.ride.findUnique({
      where: { ride_id },
      include: {
        Reservations: true,
      },
    });

    if (!ride) {
      return reply.status(404).send({ error: "Corrida não encontrada." });
    }

    // Verifica se a corrida foi completada
    if (ride.status !== "COMPLETED") {
      return reply.status(400).send({ error: "A corrida não foi finalizada." });
    }

    // Verifica se o avaliador participou da corrida e se a reserva foi confirmada
    const reservation = ride.Reservations.find(
      (reservation) => reservation.passenger_id === reviewer_id
    );

    if (!reservation || reservation.status !== "CONFIRMED") {
      return reply
        .status(403)
        .send({
          error:
            "Você não participou desta corrida ou sua reserva não foi confirmada.",
        });
    }

    // Verifica se o usuário já avaliou esta corrida
    const existingReview = await models.review.findFirst({
      where: {
        ride_id,
        reviewer_id,
      },
    });

    if (existingReview) {
      return reply.status(400).send({ error: "Você já avaliou esta corrida." });
    }

    // Cria o review
    const review = await models.review.create({
      data: {
        ride_id,
        reviewer_id,
        reviewee_id: ride.driver_id,
        rating,
        comment,
      },
    });

  request.server.eventBus.emit("reviewCreated", { reviewee_id: ride.driver_id });

    return reply.status(201).send(review);
  } catch (error) {
    console.error("Erro ao criar o review:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
