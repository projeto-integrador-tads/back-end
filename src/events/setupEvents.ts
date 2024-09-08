import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import {
  sendRideCreationEmail,
  sendRideUpdateNotification,
  sendRideCancellationNotification,
  sendWelcomeEmail,
  sendAccountDeactivationEmail,
  sendAccountReactivationEmail,
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
  // Evento de registro de usuário
  fastify.eventBus.on("userRegistered", async ({ email, name }) => {
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      fastify.log.error("Failed to send welcome email:", emailError);
    }
  });

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
          "Falha ao enviar email de criação de corrida:",
          emailError
        );
      }
    }
  );

  // Evento de atualização de corrida
  fastify.eventBus.on("rideUpdated", async (rideDetails: Ride) => {
    try {
      // Encontra todas as reservas associadas à corrida
      const reservations = await models.reservation.findMany({
        where: { ride_id: rideDetails.ride_id },
        include: {
          Passenger: true,
        },
      });

      // Envia uma notificação por e-mail para cada passageiro sobre a atualização da corrida
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
      // Encontra todas as reservas associadas à corrida
      const reservations = await models.reservation.findMany({
        where: { ride_id: rideDetails.ride_id },
        include: {
          Passenger: true,
        },
      });

      // Atualiza o status de todas as reservas para "cancelada"
      await models.reservation.updateMany({
        where: { ride_id: rideDetails.ride_id },
        data: { status: "CANCELLED" },
      });

      // Envia uma notificação por e-mail para cada passageiro sobre o cancelamento da corrida
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

  fastify.eventBus.on("accountReactivated", async ({ email, name }) => {
    try {
      await sendAccountReactivationEmail(email, name);
    } catch (emailError) {
      fastify.log.error(
        "Falha ao enviar o email de ativação de conta:",
        emailError
      );
    }
  });

  // Evento de desativação de conta
  fastify.eventBus.on("accountDeactivated", async ({ email, name }) => {
    try {
      await sendAccountDeactivationEmail(email, name);
    } catch (emailError) {
      fastify.log.error(
        "Falha ao enviar o email de desativação de conta:",
        emailError
      );
    }
  });
};
