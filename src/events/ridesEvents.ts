import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import {
  sendRideCreationEmail,
  sendRideUpdateNotification,
  sendRideCancellationNotification,
} from "../services/email/emailService";
import { Ride } from "@prisma/client";
import { NewRideType } from "../types";

export const rideEvents = (app: FastifyInstance) => {
  app.eventBus.on("rideCreated", async (data: NewRideType) => {
    try {
      await sendRideCreationEmail(data);
    } catch (emailError) {
      app.log.error("Falha ao enviar email de criação de corrida:", emailError);
    }
  });

  app.eventBus.on("rideUpdated", async (rideDetails: Ride) => {
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
      app.log.error(
        "Falha ao enviar notificação para os passageiros:",
        emailError
      );
    }
  });

  app.eventBus.on("rideCancelled", async (rideDetails: Ride) => {
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
      app.log.error(
        "Falha ao enviar notificação de cancelamento para os passageiros:",
        emailError
      );
    }
  });
};
