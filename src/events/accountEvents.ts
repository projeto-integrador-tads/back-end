import { FastifyInstance } from "fastify";
import {
  sendWelcomeEmail,
  sendAccountDeactivationEmail,
  sendAccountReactivationEmail,
  sendPasswordResetEmail,
  passwordChangedEmail,
} from "../services/email/emailService";
import { ReservationStatus, RideStatus, User } from "@prisma/client";
import { models } from "../models/models";
import { eventTypes } from "../utils/constants";

export const accountEvents = (app: FastifyInstance) => {
  app.eventBus.on("userRegistered", async (user: User) => {
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      app.log.error("Falha ao enviar email de boas vindas:", emailError);
    }
  });

  app.eventBus.on(eventTypes.accountReactivated, async (user: User) => {
    try {
      await sendAccountReactivationEmail(user.email, user.name);
    } catch (emailError) {
      app.log.error(
        "Falha ao enviar o email de ativação de conta:",
        emailError
      );
    }
  });

  app.eventBus.on(eventTypes.accountDeactivated, async (user: User) => {
    try {
      await models.reservation.updateMany({
        where: {
          passenger_id: user.id,
          status: { not: ReservationStatus.CANCELLED },
        },
        data: { status: ReservationStatus.CANCELLED },
      });

      if (user.is_driver) {
        const rides = await models.ride.findMany({
          where: {
            driver_id: user.id,
            status: { in: [RideStatus.SCHEDULED, RideStatus.IN_PROGRESS] },
          },
        });

        for (const ride of rides) {
          await models.ride.update({
            where: { ride_id: ride.ride_id },
            data: { status: RideStatus.CANCELLED },
          });

          await models.reservation.updateMany({
            where: {
              ride_id: ride.ride_id,
              status: { not: ReservationStatus.CANCELLED },
            },
            data: { status: ReservationStatus.CANCELLED },
          });

          app.eventBus.emit(eventTypes.rideCancelled, ride);
        }
      }

      await sendAccountDeactivationEmail(user.email, user.name);
    } catch (error) {
      app.log.error("Erro ao processar a desativação da conta:", error);
    }
  });

  app.eventBus.on(
    eventTypes.forgotPassword,
    async ({ email, name, resetCode }) => {
      try {
        await sendPasswordResetEmail(email, name, resetCode);
      } catch (emailError) {
        app.log.error(
          "Falha ao enviar o email de esquecimento de senha:",
          emailError
        );
      }
    }
  );

  app.eventBus.on(eventTypes.passwordChanged, async (user: User) => {
    try {
      await passwordChangedEmail(user.email, user.name);
    } catch (emailError) {
      app.log.error("Falha ao enviar o email de senha alterada:", emailError);
    }
  });
};
