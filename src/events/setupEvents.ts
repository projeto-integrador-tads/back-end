import { FastifyInstance } from "fastify";
import { rideEvents } from "./ridesEvents";
import { accountEvents } from "./accountEvents";
import { reviewEvents } from "./reviewEvents";

export const setupEvents = (fastify: FastifyInstance) => {
  rideEvents(fastify);
  accountEvents(fastify);
  reviewEvents(fastify);
};
