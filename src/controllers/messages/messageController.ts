import { FastifyPluginAsync, FastifyRequest } from "fastify";
import WebSocket from "ws";
import { sendMessage } from "../../models/messages/sendMessage";
import { getMessagesByRide } from "../../models/messages/getMessagesByRide";
import { paginationSchema } from "../../utils/schemas";
import { messageListingParamans } from "../../models/messages/validations/schemas";
import { WebSocketWithUserData } from "../../types";

export const messageController: FastifyPluginAsync = async (app) => {
  app.get(
    "/ws",
    { websocket: true },
    (socket: WebSocketWithUserData, req: FastifyRequest) => {
      const userId = req.userData?.id;

      if (userId) {
        socket.userData = { id: userId };
      }

      socket.on("message", async (message) => {
        await sendMessage(socket, req, message.toString());
      });

      socket.on("close", () => {
        app.eventBus.removeAllListeners();
      });
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
};
