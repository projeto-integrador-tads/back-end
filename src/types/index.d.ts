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
import {
  CompanyData,
  PaymentStatus,
  ReservationStatus,
  eventTypes,
  pushTypes,
} from "../utils/constants";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
} from "../models/auth/validations/schemas";
import {
  createReviewSchema,
  reviewIdSchema,
  updateReviewSchema,
} from "../models/reviews/validations/schemas";
import {
  addressIdSchema,
  createAddressSchema,
} from "../models/addresses/validations/schemas";

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

export type NewRideType = Prisma.RideGetPayload<{
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

type CreateAddress = z.infer<typeof createAddressSchema>;
type AddressIdInput = z.infer<typeof addressIdSchema>;

type ForgotPasswordRequestBody = z.infer<typeof forgotPasswordSchema>;
type LoginRequestBody = z.infer<typeof loginSchema>;
type ResetPasswordRequestBody = z.infer<typeof resetPasswordSchema>;
type VerifyResetCode = z.infer<typeof verifyResetCodeSchema>;

type CreateReviewBody = z.infer<typeof createReviewSchema>;
type DeleteReviewParams = z.infer<typeof reviewIdSchema>;
type UpdateReviewParams = z.infer<typeof reviewIdSchema>;
type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export type CancelRideInput = z.infer<typeof rideIdSchema>;
export type SearchRide = z.infer<typeof rideIdSchema>;
export type StartRide = z.infer<typeof rideIdSchema>;
export type SearchRideByCity = z.infer<typeof searchRideByCitySchema>;
export type CreateRideInput = z.infer<typeof createRideSchema>;
export type UpdateRideInput = z.infer<typeof updateRideSchema>;

export type PaginationInput = z.infer<typeof paginationSchema>;
export type getConfirmedReservationsByRideIdInput = z.infer<
  typeof paginationSchema
>;
export type getReservationsByUserInputQueryString = z.infer<
  typeof paginationSchema
>;
export type GetAllReservationsByRideInput = z.infer<typeof paginationSchema>;

export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleRequestBody = TypeOf<typeof vehicleSchema>;
export type VehicleIdParams = TypeOf<typeof reactivateVehicleSchema>;
export type DeleteVehicleInput = TypeOf<typeof deleteVehicleSchema>;
export type EndRide = z.infer<typeof rideIdSchema>;

export type UserIdSchema = z.infer<typeof userIdSchema>;
export type UserRequestBody = TypeOf<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type GetConfirmedReservationsByRideIdParams = z.infer<
  typeof rideIdSchema
>;
export type ConfirmReservationInput = z.infer<typeof confirmReservationSchema>;

export type CompanyDataType = (typeof CompanyData)[keyof typeof CompanyData];
export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

export type ReservationStatusType =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];

export type EventTypes = (typeof eventTypes)[keyof typeof eventTypes];

export type ChangePasswordRequestBody = z.infer<typeof changePasswordSchema>;
export type PushTypes = (typeof pushTypes)[keyof typeof pushTypes];
interface WebSocketWithUserData extends WebSocket {
  userData?: { id: string };
}
