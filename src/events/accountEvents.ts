import { FastifyInstance } from "fastify";
import {
  sendWelcomeEmail,
  sendAccountDeactivationEmail,
  sendAccountReactivationEmail,
  sendPasswordResetEmail,
  passwordChangedEmail,
} from "../services/email/emailService";

export const accountEvents = (fastify: FastifyInstance) => {
  // Evento de registro de usuário
  fastify.eventBus.on("userRegistered", async ({ email, name }) => {
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      fastify.log.error("Failed to send welcome email:", emailError);
    }
  });

  // Evento de ativação de conta
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

  fastify.eventBus.on("forgotPassword", async ({ email, name, resetCode }) => {
    try {
      await sendPasswordResetEmail(email, name, resetCode);
    } catch (emailError) {
      fastify.log.error(
        "Falha ao enviar o email de esquecimento de senha:",
        emailError
      );
    }
  })

  fastify.eventBus.on("passwordChanged", async ({ email, name }) => {
    try {
      await passwordChangedEmail(email, name);
    } catch (emailError) {
      fastify.log.error(
        "Falha ao enviar o email de senha alterada:",
        emailError
      );
    }
  })
};
