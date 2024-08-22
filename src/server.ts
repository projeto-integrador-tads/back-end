import Fastify from "fastify";
import "dotenv/config";

import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import eventPlugin from "./plugins/eventBus";
import { setupEvents } from "./events/setupEvents";
import { ridesController } from "./controllers/rides/ridesController";
import { userController } from "./controllers/users/userController";
import { vehicleController } from "./controllers/vehicles/vehicleController";
import { reservationController } from "./controllers/reservations/reservationController";
const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(userController);
app.register(vehicleController);
app.register(ridesController);
app.register(reservationController);

app.register(eventPlugin);

app.ready((err) => {
  if (err) {
    console.error("Erro ao iniciar o Fastify:", err);
    process.exit(1);
  }

  setupEvents(app);
  console.log("Servidor pronto para receber requisições.");
});

app
  .listen({ port: 3000 })
  .then(() => {
    console.log("Servidor rodando em http://localhost:3000");
  })
  .catch((err) => {
    console.error("Falha ao iniciar o servidor:", err);
    process.exit(1);
  });
