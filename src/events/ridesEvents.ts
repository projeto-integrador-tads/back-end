import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import {
  sendRideCreationEmail,
  sendRideUpdateNotification,
  sendRideCancellationNotification,
} from "../services/email/emailService";
import { Decimal } from "@prisma/client/runtime/library";

interface Ride {
  ride_id: string;
  start_location: string;
  end_location: string;
  start_time: Date;
  end_time: Date | null;
  price: Decimal;
  available_seats: number;
  preferences: string;
}

export const rideEvents = (fastify: FastifyInstance) => {
  // Evento de criação de corrida
  fastify.eventBus.on(
    "rideCreated",
    async ({
      name,
      email,
      start_location,
      end_location,
      start_time,
      price,
      available_seats,
      preferences,
    }) => {
      try {
        await sendRideCreationEmail(
          name,
          email,
          start_location,
          end_location,
          start_time,
          price,
          available_seats,
          preferences
        );
      } catch (emailError) {
        fastify.log.error(
          "Falha ao enviar email de criação de corrida:",
          emailError
        );
      }
    }
  );

  // Evento de atualização de corrida
  fastify.eventBus.on("rideUpdated", async (rideDetails: Ride) => {
    try {
      const reservations = await models.reservation.findMany({
        where: { ride_id: rideDetails.ride_id },
        include: {
          Passenger: true,
        },
      });

      const notifications = reservations.map((reservation) =>
        sendRideUpdateNotification(
          reservation.Passenger.email,
          reservation.Passenger.name
        )
      );

      await Promise.all(notifications);
    } catch (emailError) {
      fastify.log.error(
        "Falha ao enviar notificação para os passageiros:",
        emailError
      );
    }
  });

  // Evento de cancelamento de corrida
  fastify.eventBus.on("rideCancelled", async (rideDetails: Ride) => {
    try {
      const reservations = await models.reservation.findMany({
        where: { ride_id: rideDetails.ride_id },
        include: {
          Passenger: true,
        },
      });

      await models.reservation.updateMany({
        where: { ride_id: rideDetails.ride_id },
        data: { status: "CANCELLED" },
      });

      const notifications = reservations.map((reservation) =>
        sendRideCancellationNotification(
          reservation.Passenger.email,
          reservation.Passenger.name
        )
      );

      await Promise.all(notifications);
    } catch (emailError) {
      fastify.log.error(
        "Falha ao enviar notificação de cancelamento para os passageiros:",
        emailError
      );
    }
  });
};
