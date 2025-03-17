import { FastifyPluginAsync, FastifyRequest } from "fastify";
import { sendMessage } from "../../models/messages/sendMessage";
import { getMessagesByRide } from "../../models/messages/getMessagesByRide";
import { getUserConversations } from "../../models/messages/getConversations";
import { getPossibleRecipients } from "../../models/messages/getPossibleRecipients";
import { paginationSchema } from "../../utils/schemas";
import { messageListingParamans, sendMessageSchema } from "../../models/messages/validations/schemas";
import { WebSocketWithUserData } from "../../types";
import { models } from "../../models/models";
import { ReservationStatus, RideStatus } from "../../utils/constants";

export const messageController: FastifyPluginAsync = async (app) => {
  app.get(
    "/ws/message",
    { websocket: true },
    (socket: WebSocketWithUserData, req: FastifyRequest) => {
      const userId = req.userData?.id;
      socket.userData = { id: userId! };

      socket.on("message", async (message) => {
        await sendMessage(socket, req, message.toString());
      });

      socket.on("close", () => {
        app.eventBus.removeAllListeners();
      });
    }
  );

  app.post(
    "/messages",
    {
      schema: {
        body: sendMessageSchema,
      },
    },
    async (request, reply) => {
      const senderId = request.userData?.id;

      if (!senderId) {
        return reply.status(401).send({ error: "Usuário não autenticado." });
      }

      try {
        const { ride_id: rideId, receiver_id: receiverId, content } = request.body;

        const ride = await models.ride.findUnique({
          where: { ride_id: rideId },
          include: { Reservations: true },
        });

        if (!ride || ride.status === RideStatus.COMPLETED) {
          return reply.status(404).send({ error: "Corrida não encontrada ou já finalizada." });
        }

        const isDriver = ride.driver_id === senderId;
        const isPassenger = ride.Reservations.some(
          (res) =>
            res.passenger_id === senderId &&
            (res.status === ReservationStatus.PENDING ||
              res.status === ReservationStatus.CONFIRMED)
        );

        if (!isDriver && !isPassenger) {
          return reply.status(403).send({
            error: "Você não tem permissão para enviar mensagens nesta corrida.",
          });
        }

        const isReceiverDriver = ride.driver_id === receiverId;
        const isReceiverPassenger = ride.Reservations.some(
          (res) =>
            res.passenger_id === receiverId &&
            (res.status === ReservationStatus.PENDING ||
              res.status === ReservationStatus.CONFIRMED)
        );

        if (!isReceiverDriver && !isReceiverPassenger) {
          return reply.status(400).send({ error: "Destinatário inválido." });
        }

        const message = await models.message.create({
          data: {
            sender_id: senderId,
            receiver_id: receiverId,
            ride_id: rideId,
            content,
          },
        });

        // Emit the message to connected WebSocket clients
        const receiverConnection = Array.from(
          request.server.websocketServer.clients
        ).find((client: any) => client.userData?.id === receiverId);

        if (receiverConnection) {
          receiverConnection.send(JSON.stringify(message));
        }

        request.server.eventBus.emit('messageReceived', message);

        return reply.status(201).send(message);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Erro interno no servidor." });
      }
    }
  );

  app.get(
    "/messages/:ride_id",
    {
      schema: {
        querystring: paginationSchema,
        params: messageListingParamans,
      },
    },
    getMessagesByRide
  );

  app.get(
    "/messages/conversations",
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    getUserConversations
  );

  app.get("/messages/possible-recipients", getPossibleRecipients);
};
