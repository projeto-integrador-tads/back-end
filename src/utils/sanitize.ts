import { Address, Ride, User, Vehicle, Reservation } from "@prisma/client";

export const sanitizeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  last_name: user.last_name,
  email: user.email,
  phone_number: user.phone_number,
  active: user.active,
  is_driver: user.is_driver,
  average_rating: user.average_rating,
});

export const sanitizeVehicle = (vehicle: Vehicle) => ({
  vehicle_id: vehicle.vehicle_id,
  owner_id: vehicle.owner_id,
  model: vehicle.model,
  year: vehicle.year,
  color: vehicle.color,
  active: vehicle.active,
  seats: vehicle.seats,
});

export const sanitizeAddress = (address: Address) => ({
  id: address.id,
  latitude: address.latitude,
  longitude: address.longitude,
  city: address.city,
  formattedAddress: address.formattedAddress,
});

export const sanitizeRide = (ride: Ride) => ({
  ride_id: ride.ride_id,
  driver_id: ride.driver_id,
  vehicle_id: ride.vehicle_id,
  start_address_id: ride.start_address_id,
  end_address_id: ride.end_address_id,
  start_time: ride.start_time,
  price: ride.price,
  available_seats: ride.available_seats,
  preferences: ride.preferences,
  status: ride.status,
});

export const sanitizeReservation = (reservation: Reservation) => ({
  reservation_id: reservation.reservation_id,
  ride_id: reservation.ride_id,
  passenger_id: reservation.passenger_id,
  status: reservation.status,
  payment_status: reservation.payment_status,
  createdAt: reservation.createdAt,
  updatedAt: reservation.updatedAt,
});
