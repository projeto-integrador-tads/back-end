import fp from "fastify-plugin";
import { EventEmitter } from "events";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    eventBus: EventEmitter;
  }
}

async function eventBus(fastify: FastifyInstance, options: any) {
  fastify.decorate("eventBus", new EventEmitter());

  fastify.addHook("onClose", (instance, done) => {
    instance.eventBus.removeAllListeners();
    done();
  });
}

export default fp(eventBus);
