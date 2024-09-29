import "fastify";
import WebSocket from "ws";
import {
  cancelRideSchema,
  createRideSchema,
  rideIdSchema,
  searchRideByCitySchema,
  updateRideSchema,
} from "../models/rides/validations/schemas";
import { TypeOf, z } from "zod";
import { paginationSchema } from "../utils/schemas";
import {
  deleteVehicleSchema,
  reactivateVehicleSchema,
  updateVehicleSchema,
  vehicleSchema,
} from "../models/vehicles/validation/schemas";
import {
  updateUserSchema,
  userIdSchema,
  userSchema,
} from "../models/users/validations/schema";
import {
  cancelReservationSchema,
  confirmReservationSchema,
  createReservationSchema,
  reservationIdSchema,
} from "../models/reservations/validations/schemas";
import { Prisma } from "@prisma/client";

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

type NewRideType = Prisma.RideGetPayload<{
  include: {
    StartAddress: true;
    EndAddress: true;
    Driver: {
      select: {
        name: true;
        last_name: true;
        email: true;
      };
    };
  };
}>;

type CancelRideInput = z.infer<typeof rideIdSchema>;
type SearchRide = z.infer<typeof rideIdSchema>;
type StartRide = z.infer<typeof rideIdSchema>;
type SearchRideByCity = z.infer<typeof searchRideByCitySchema>;
type CreateRideInput = z.infer<typeof createRideSchema>;
type UpdateRideInput = z.infer<typeof updateRideSchema>;

type PaginationInput = z.infer<typeof paginationSchema>;
type getConfirmedReservationsByRideIdInput = z.infer<typeof paginationSchema>;
type getReservationsByUserInputQueryString = z.infer<typeof paginationSchema>;
type GetAllReservationsByRideInput = z.infer<typeof paginationSchema>;

type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
type VehicleRequestBody = TypeOf<typeof vehicleSchema>;
type VehicleIdParams = TypeOf<typeof reactivateVehicleSchema>;
type DeleteVehicleInput = TypeOf<typeof deleteVehicleSchema>;
type EndRide = z.infer<typeof rideIdSchema>;

type UserIdSchema = z.infer<typeof userIdSchema>;
type UserRequestBody = TypeOf<typeof userSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
type CreateReservationInput = z.infer<typeof createReservationSchema>;
type GetConfirmedReservationsByRideIdParams = z.infer<typeof rideIdSchema>;
type ConfirmReservationInput = z.infer<typeof confirmReservationSchema>;
