import Fastify from "fastify";
import "dotenv/config";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import eventPlugin from "../plugins/eventBus";
import { setupEvents } from "../events/setupEvents";
import { ridesController } from "../controllers/rides/ridesController";
import { userController } from "../controllers/users/userController";
import { vehicleController } from "../controllers/vehicles/vehicleController";
import { reservationController } from "../controllers/reservations/reservationController";
import jwtPlugin from "../plugins/jwtPlugin";
import { authController } from "../controllers/auth/auth";
import { reviewsController } from "../controllers/reviews/reviewController";
import websocket from "@fastify/websocket";
import { messageController } from "../controllers/messages/messageController";
import fastifyMultipart from "@fastify/multipart";
import { ZodError } from "zod";
import { addressController } from "../controllers/addresses/addressController";
import fastifySchedule from "@fastify/schedule";
import { setupTokenCleanupTask } from "./tasks/clearTokens";

const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyMultipart);
app.register(jwtPlugin);
app.register(userController);
app.register(vehicleController);
app.register(ridesController);
app.register(reservationController);
app.register(authController);
app.register(reviewsController);
app.register(websocket, { options: { clientTracking: true }});
app.register(eventPlugin);
app.register(messageController);
app.register(addressController);
app.register(fastifySchedule);

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      issues: error.issues,
    });
    return;
  }

  reply.send(error);
});

app.ready((err) => {
  if (err) {
    console.error("Erro ao iniciar o Fastify:", err);
    process.exit(1);
  }
  setupEvents(app);
  const job = setupTokenCleanupTask(app);
  app.scheduler.addSimpleIntervalJob(job);
});

export default app;
