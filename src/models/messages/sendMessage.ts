import { FastifyRequest } from "fastify";
import { models } from "../models";
import { z } from "zod";
import WebSocket from "ws";
import { ReservationStatus, RideStatus } from "../../utils/constants";

const messageSchema = z.object({
  ride_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  content: z.string().min(1).max(500),
});

export async function sendMessage(
  socket: WebSocket,
  request: FastifyRequest,
  messageData: string
) {
  const sender_id = request.userData?.id;

  if (!sender_id) {
    socket.send(JSON.stringify({ error: "Usuário não autenticado." }));
    return;
  }

  try {
    const parsedMessage = messageSchema.parse(JSON.parse(messageData));
    const { ride_id, receiver_id, content } = parsedMessage;

    const ride = await models.ride.findUnique({
      where: { ride_id },
      include: { Reservations: true },
    });

    if (!ride || ride.status === RideStatus.COMPLETED) {
      socket.send(
        JSON.stringify({ error: "Corrida não encontrada ou já finalizada." })
      );
      return;
    }

    const isDriver = ride.driver_id === sender_id;
    const isPassenger = ride.Reservations.some(
      (res) =>
        res.passenger_id === sender_id &&
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

    const isReceiverDriver = ride.driver_id === receiver_id;
    const isReceiverPassenger = ride.Reservations.some(
      (res) =>
        res.passenger_id === receiver_id &&
        (res.status === "PENDING" || res.status === "CONFIRMED")
    );

    if (!isReceiverDriver && !isReceiverPassenger) {
      socket.send(JSON.stringify({ error: "Destinatário inválido." }));
      return;
    }

    const message = await models.message.create({
      data: {
        sender_id,
        receiver_id,
        ride_id,
        content,
      },
    });

    const messageToSend = JSON.stringify(message);

    const receiverConnection = Array.from(
      request.server.websocketServer.clients
    ).find((client: any) => client.userData?.id === receiver_id);

    if (receiverConnection) {
      receiverConnection.send(messageToSend);
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    socket.send(JSON.stringify({ error: "Erro interno no servidor." }));
  }
}
