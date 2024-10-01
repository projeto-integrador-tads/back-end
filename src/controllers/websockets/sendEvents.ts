import { FastifyPluginAsync, FastifyRequest } from "fastify";
import { WebSocketWithUserData } from "../../types";

export const websocketsController: FastifyPluginAsync = async (fastify) => {
  // fastify.get(
  //   "/ws/events",
  //   { websocket: true },
  //   (socket: WebSocketWithUserData, req: FastifyRequest) => {
  //     const userId = req.userData?.id;
  //     if (userId) {
  //       socket.userData = { id: userId };
  //     }
  //     socket.on("close", () => {
  //       fastify.eventBus.removeAllListeners();
  //     });
  //   }
  // );
};
