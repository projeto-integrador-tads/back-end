import { FastifyRequest } from "fastify";
import { models } from "../../models";
import { z } from "zod";
import WebSocket from "ws";
import { ReservationStatus, RideStatus } from "../../../utils/constants";

async function validateSender(
  sender_id: string | undefined,
  socket: WebSocket
) {
  if (!sender_id) {
    socket.send(JSON.stringify({ error: "Usuário não autenticado." }));
    return false;
  }
  return true;
}

async function validateRide(ride_id: string) {
  const ride = await models.ride.findUnique({
    where: { ride_id },
    include: { Reservations: true },
  });

  if (!ride || ride.status === RideStatus.COMPLETED) {
    throw new Error("Corrida não encontrada ou já finalizada.");
  }

  return ride;
}

function validateParticipants(
  ride: any,
  sender_id: string,
  receiver_id: string
) {
  const isDriver = ride.driver_id === sender_id;
  const isPassenger = ride.Reservations.some(
    (res: any) =>
      res.passenger_id === sender_id &&
      (res.status === ReservationStatus.PENDING ||
        res.status === ReservationStatus.CONFIRMED)
  );

  if (!isDriver && !isPassenger) {
    throw new Error(
      "Você não tem permissão para enviar mensagens nesta corrida."
    );
  }

  const isReceiverDriver = ride.driver_id === receiver_id;
  const isReceiverPassenger = ride.Reservations.some(
    (res: any) =>
      res.passenger_id === receiver_id &&
      (res.status === ReservationStatus.PENDING ||
        res.status === ReservationStatus.CONFIRMED)
  );

  if (!isReceiverDriver && !isReceiverPassenger) {
    throw new Error("Destinatário inválido.");
  }
}

async function createAndSendMessage(
  sender_id: string,
  receiver_id: string,
  ride_id: string,
  content: string,
  socket: WebSocket,
  request: FastifyRequest
) {
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

  socket.send(messageToSend);
}
