import { FastifyRequest } from "fastify";
import { models } from "../models";
import WebSocket from "ws";
import {
  ReservationStatus,
  RideStatus,
  eventTypes,
} from "../../utils/constants";
import { sendMessageSchema } from "./validations/schemas";

export async function sendMessage(
  socket: WebSocket,
  request: FastifyRequest,
  messageData: string
) {
  const senderId = request.userData?.id;

  if (!senderId) {
    socket.send(JSON.stringify({ error: "Usuário não autenticado." }));
    return;
  }

  try {
    const parsedMessage = sendMessageSchema.parse(JSON.parse(messageData));
    const { ride_id: rideId, receiver_id: receiverId, content } = parsedMessage;

    const ride = await models.ride.findUnique({
      where: { ride_id: rideId },
      include: { Reservations: true },
    });

    if (!ride || ride.status === RideStatus.COMPLETED) {
      socket.send(
        JSON.stringify({ error: "Corrida não encontrada ou já finalizada." })
      );
      return;
    }

    const isDriver = ride.driver_id === senderId;
    const isPassenger = ride.Reservations.some(
      (res) =>
        res.passenger_id === senderId &&
        (res.status === ReservationStatus.PENDING ||
          res.status === ReservationStatus.CONFIRMED)
    );

    if (!isDriver && !isPassenger) {
      socket.send(
        JSON.stringify({
          error: "Você não tem permissão para enviar mensagens nesta corrida.",
        })
      );
      return;
    }

    const isReceiverDriver = ride.driver_id === receiverId;
    const isReceiverPassenger = ride.Reservations.some(
      (res) =>
        res.passenger_id === receiverId &&
        (res.status === ReservationStatus.PENDING ||
          res.status === ReservationStatus.CONFIRMED)
    );

    if (!isReceiverDriver && !isReceiverPassenger) {
      socket.send(JSON.stringify({ error: "Destinatário inválido." }));
      return;
    }

    const message = await models.message.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        ride_id: rideId,
        content,
      },
    });

    const messageToSend = JSON.stringify(message);

    socket.send(JSON.stringify({ sucess: true }));

    const receiverConnection = Array.from(
      request.server.websocketServer.clients
    ).find((client: any) => client.userData?.id === receiverId);

    if (receiverConnection) {
      receiverConnection.send(messageToSend);
    }

    request.server.eventBus.emit(eventTypes.messageReceived, message);
  } catch (error) {
    socket.send(JSON.stringify({ error: "Erro interno no servidor." }));
  }
}
