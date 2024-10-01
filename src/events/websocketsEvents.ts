import { FastifyInstance } from "fastify";
import { eventTypes } from "../utils/constants";
import { WebSocketWithUserData } from "../types";

export const websocketEvents = (app: FastifyInstance) => {
  const closeConnection = (client: WebSocketWithUserData, userId: string) => {
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        resolve();
      }, 5000);

      client.close(1000, "Logout.");

      client.on("close", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  };

  app.eventBus.on(eventTypes.userLoggedOut, async (loggedOutUserId: string) => {
    const closingPromises = Array.from(app.websocketServer.clients)
      .filter(
        (client: WebSocketWithUserData) =>
          client.userData?.id === loggedOutUserId
      )
      .map((client: WebSocketWithUserData) =>
        closeConnection(client, loggedOutUserId)
      );

    await Promise.all(closingPromises);
  });
};
