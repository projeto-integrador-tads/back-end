import { FastifyInstance } from "fastify";
import { rideEvents } from "./ridesEvents";
import { accountEvents } from "./accountEvents";
import { reviewEvents } from "./reviewEvents";

export const setupEvents = (app: FastifyInstance) => {
  rideEvents(app);
  accountEvents(app);
  reviewEvents(app);
};
