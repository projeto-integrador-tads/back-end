import { FastifyPluginAsync, FastifyRequest } from "fastify";
import WebSocket from "ws";
import { sendMessage } from "../../models/messages/sendMessage";
import { getMessagesByRide } from "../../models/messages/getMessagesByRide";
import { messageListingParamans, paginationSchema } from "../../utils/schemas";

interface WebSocketWithUserData extends WebSocket {
  userData?: { id: string };
}

export const messageController: FastifyPluginAsync = async (fastify) => {
  fastify.get(
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
    }
  );

  fastify.get(
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
