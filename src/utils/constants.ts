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

export type ReservationStatusType =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;

export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const CompanyData = {
  COMPANY_NAME: "VemComigo",
  COMPANY_EMAIL: "vemcomigo@rides.com",
} as const;

export type CompanyDataType = (typeof CompanyData)[keyof typeof CompanyData];
