import "fastify";
import WebSocket from "ws";
import {
  cancelRideSchema,
  createRideSchema,
  rideIdSchema,
  searchRideByCitySchema,
  updateRideSchema,
} from "../models/rides/validations/schemas";
import { z } from "zod";
import { paginationSchema } from "../utils/schemas";

interface JwtPayload {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: import("fastify").FastifyMiddleware;
  }

  interface FastifyRequest {
    userData?: JwtPayload;
  }

  interface FastifyContextConfig {
    public?: boolean;
  }

  interface FastifyInstance {
    jwtAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

type CancelRideInput = z.infer<typeof rideIdSchema>;
type SearchRide = z.infer<typeof rideIdSchema>;
type StartRide = z.infer<typeof rideIdSchema>;
type SearchRideByCity = z.infer<typeof searchRideByCitySchema>;
type CreateRideInput = z.infer<typeof createRideSchema>;
type UpdateRideInput = z.infer<typeof updateRideSchema>;
type PaginationInput = z.infer<typeof paginationSchema>;
