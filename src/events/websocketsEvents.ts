import { FastifyInstance } from "fastify";
import { eventTypes } from "../utils/constants";
import { WebSocketWithUserData } from "../types";

export const websocketEvents = (app: FastifyInstance) => {
  app.eventBus.on(eventTypes.userLoggedOut, (loggedOutUserId: string) => {
    app.websocketServer.clients.forEach((client: WebSocketWithUserData) => {
      if (client.userData?.id === loggedOutUserId) {
        client.close();
      }
    });
  });
};
