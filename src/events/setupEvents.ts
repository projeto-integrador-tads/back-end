import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import {
  sendRideCreationEmail,
  sendRideUpdateNotification,
  sendWelcomeEmail,
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

export const setupEvents = (fastify: FastifyInstance) => {
  fastify.eventBus.on("userRegistered", async ({ email, name }) => {
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      fastify.log.error("Failed to send welcome email:", emailError);
    }
  });

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
      // Envia email para o dono da corrida sobre a criação da corrida
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
          "Falha ao enviar que uma corrida foi criada:",
          emailError
        );
      }
    }
  );

  fastify.eventBus.on("rideUpdated", async (rideDetails: Ride) => {
    try {
      // Encontra todas as reservas associadas à corrida
      const reservations = await models.reservation.findMany({
        where: { ride_id: rideDetails.ride_id },
        include: {
          Passenger: true,
        },
      });

      // Envia uma notificação por e-mail para cada passageiro

      const notifications = reservations.map((reservation) =>
        sendRideUpdateNotification(
          reservation.Passenger.email,
          reservation.Passenger.name
        )
      );

      await Promise.all(notifications);
    } catch (emailError) {
      fastify.log.error(
        "Falha ao enviar notifição para os passageiros:",
        emailError
      );
    }
  });
};
