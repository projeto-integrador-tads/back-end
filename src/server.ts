import Fastify from "fastify";
import "dotenv/config";

import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { userRoutes } from "./routes/userRoutes";
import { vehicleRoutes } from "./routes/vehicleRoutes";
import { rideRoutes } from "./routes/ridesRoutes";
import { reservationRoutes } from "./routes/reservationsRoutes";

const app = Fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(userRoutes);
app.register(vehicleRoutes);
app.register(rideRoutes);
app.register(reservationRoutes);

app.listen({ port: 3000 }).then(() => {
  console.log("Servidor rodando em http://localhost:3000");
});
