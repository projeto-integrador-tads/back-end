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

    // Check if the reviewer is either the driver or a passenger
    const isDriver = ride.driver_id === reviewerId;
    const isPassenger = ride.Reservations.some(
      (reservation) => 
        reservation.passenger_id === reviewerId && 
        reservation.status === ReservationStatus.CONFIRMED
    );

    if (!isDriver && !isPassenger) {
      return reply.status(403).send({
        error: "Você não participou desta corrida como motorista ou passageiro.",
      });
    }

    // If reviewer is driver, reviewee must be a passenger
    // If reviewer is passenger, reviewee must be the driver
    let revieweeId: string;
    if (isDriver) {
      // Driver reviewing a passenger - require passenger_id in the request
      const { passenger_id: passengerId } = request.body;
      if (!passengerId) {
        return reply.status(400).send({ error: "ID do passageiro é necessário para avaliação." });
      }

      const passengerReservation = ride.Reservations.find(
        (reservation) => 
          reservation.passenger_id === passengerId && 
          reservation.status === ReservationStatus.CONFIRMED
      );

      if (!passengerReservation) {
        return reply.status(403).send({
          error: "O passageiro especificado não participou desta corrida ou sua reserva não foi confirmada.",
        });
      }

      revieweeId = passengerId;
    } else {
      // Passenger reviewing the driver
      revieweeId = ride.driver_id;
    }

    const existingReview = await models.review.findFirst({
      where: {
        ride_id: rideId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
      },
    });

    if (existingReview) {
      return reply.status(400).send({ error: "Você já avaliou esta corrida." });
    }

    const review = await models.review.create({
      data: {
        ride_id: rideId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment,
      },
    });

    request.server.eventBus.emit(eventTypes.reviewCreated, {
      reviewee_id: revieweeId,
    });

    return reply.status(201).send(review);
  } catch (error) {
    console.error("Erro ao criar o review:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
