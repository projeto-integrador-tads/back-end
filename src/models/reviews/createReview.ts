import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import {
  ReservationStatus,
  RideStatus,
  eventTypes,
} from "../../utils/constants";
import { CreateReviewBody } from "../../types";

export async function createReview(
  request: FastifyRequest<{
    Body: CreateReviewBody;
  }>,
  reply: FastifyReply
) {
  const { ride_id: rideId, rating, comment } = request.body;
  const reviewerId = request.userData?.id;

  if (!reviewerId) {
    return reply.status(400).send({ error: "ID do avaliador não encontrado." });
  }

  try {
    const ride = await models.ride.findUnique({
      where: { ride_id: rideId },
      include: {
        Reservations: true,
      },
    });

    if (!ride) {
      return reply.status(404).send({ error: "Corrida não encontrada." });
    }

    if (ride.status !== RideStatus.COMPLETED) {
      return reply.status(400).send({ error: "A corrida não foi finalizada." });
    }

    const reservation = ride.Reservations.find(
      (reservation) => reservation.passenger_id === reviewerId
    );

    if (!reservation || reservation.status !== ReservationStatus.CONFIRMED) {
      return reply.status(403).send({
        error:
          "Você não participou desta corrida ou sua reserva não foi confirmada.",
      });
    }

    const existingReview = await models.review.findFirst({
      where: {
        ride_id: rideId,
        reviewer_id: reviewerId,
      },
    });

    if (existingReview) {
      return reply.status(400).send({ error: "Você já avaliou esta corrida." });
    }

    const review = await models.review.create({
      data: {
        ride_id: rideId,
        reviewer_id: reviewerId,
        reviewee_id: ride.driver_id,
        rating,
        comment,
      },
    });

    request.server.eventBus.emit(eventTypes.reviewCreated, {
      reviewee_id: ride.driver_id,
    });

    return reply.status(201).send(review);
  } catch (error) {
    console.error("Erro ao criar o review:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
