export const RideStatus = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type RideStatusType = (typeof RideStatus)[keyof typeof RideStatus];

export const ReservationStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;

export const CompanyData = {
  COMPANY_NAME: "VemComigo",
  COMPANY_EMAIL: "vemcomigo@rides.com",
} as const;

export const eventTypes = {
  rideCreated: "rideCreated",
  rideUpdated: "rideUpdated",
  rideCancelled: "rideCancelled",
  rideStarted: "rideStarted",
  rideEnded: "rideEnded",
  reservationCreated: "reservationCreated",
  reservationConfirmed: "reservationConfirmed",
  reservationCancelled: "reservationCancelled",
  messageReceived: "messageReceived",
  userRegistered: "userRegistered",
  accountReactivated: "accountReactivated",
  accountDeactivated: "accountDeactivated",
  forgotPassword: "forgotPassword",
  passwordChanged: "passwordChanged",
  reviewCreated: "reviewCreated",
  reviewUpdated: "reviewUpdated",
  reviewDeleted: "reviewDeleted",
} as const;

export const pushTypes = {
  rideCreated: "rideCreated",
  rideUpdated: "rideUpdated",
  rideCancelled: "rideCancelled",
  rideStarted: "rideStarted",
  rideEnded: "rideEnded",
  reservationCreated: "reservationCreated",
  reservationConfirmed: "reservationConfirmed",
  reservationCancelled: "reservationCancelled",
  messageReceived: "messageReceived",
} as const;
