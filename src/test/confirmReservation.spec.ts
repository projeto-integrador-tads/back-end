import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import app from "../config/app";
import { dayjs } from "../utils/dayjs";
import { models } from "../models/models";
import { ReservationStatus } from "../utils/constants";

let server: FastifyInstance;
let userToken: string;
let driverToken: string;
let userId: string;
let driverId: string;
let vehicleId: string;
let rideId: string;
let reservationId: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  const userResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "João",
      last_name: "Silva",
      email: "joao.silva@example.com",
      password: "Senha@123",
      phone_number: "3399998888",
    },
  });
  userId = JSON.parse(userResponse.body).id;

  const driverResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Maria",
      last_name: "Santos",
      email: "maria.santos@example.com",
      password: "Senha@456",
      phone_number: "3377776666",
    },
  });
  driverId = JSON.parse(driverResponse.body).id;

  const userLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "joao.silva@example.com",
      password: "Senha@123",
    },
  });
  userToken = JSON.parse(userLoginResponse.body).token;

  const driverLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "maria.santos@example.com",
      password: "Senha@456",
    },
  });
  driverToken = JSON.parse(driverLoginResponse.body).token;

  const vehicleResponse = await server.inject({
    method: "POST",
    url: "/vehicles",
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
    payload: {
      brand: "Fiat",
      model: "Uno",
      year: 2010,
      license_plate: "ABC1234",
      color: "Branco",
      seats: 4,
    },
  });
  vehicleId = JSON.parse(vehicleResponse.body).vehicle_id;

  const rideResponse = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_latitude: -16.5089,
      start_longitude: -41.7869,
      end_latitude: -18.2494,
      end_longitude: -43.6005,
      start_time: dayjs().add(24, "hour").toISOString(),
      price: 150.0,
      available_seats: 3,
      preferences: "Sem fumantes, por favor",
    },
  });
  rideId = JSON.parse(rideResponse.body).ride_id;

  const reservationResponse = await server.inject({
    method: "POST",
    url: `/reservations/${rideId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  reservationId = JSON.parse(reservationResponse.body).reservation_id;
});

afterAll(async () => {
  await models.reservation.deleteMany({});
  await models.ride.deleteMany({});
  await models.vehicle.deleteMany({});
  await models.user.deleteMany({});
  await server.close();
});

test("Deve confirmar uma reserva com sucesso", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/reservations/confirm/${reservationId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.reservation.status).toBe(ReservationStatus.CONFIRMED);
});

test("Não deve confirmar uma reserva inexistente", async () => {
  const fakeReservationId = "00000000-0000-0000-0000-000000000000";
  const response = await server.inject({
    method: "POST",
    url: `/reservations/confirm/${fakeReservationId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Reserva não encontrada.");
});

test("Não deve confirmar uma reserva de uma corrida que não pertence ao usuário", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/reservations/confirm/${reservationId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe(
    "Você não tem permissão para confirmar esta reserva."
  );
});

test("Não deve confirmar uma reserva já cancelada", async () => {
  await server.inject({
    method: "POST",
    url: `/reservations/cancel/${reservationId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  const response = await server.inject({
    method: "POST",
    url: `/reservations/confirm/${reservationId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Você já cancelou essa reserva.");
});

test("Não deve confirmar uma reserva de uma corrida já iniciada", async () => {
  const newUserResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Novo",
      last_name: "Usuário",
      email: "novo.usuario@example.com",
      password: "Senha@789",
      phone_number: "1122334455",
    },
  });
  const newUserId = JSON.parse(newUserResponse.body).id;

  const newUserLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "novo.usuario@example.com",
      password: "Senha@789",
    },
  });
  const newUserToken = JSON.parse(newUserLoginResponse.body).token;

  const newRideResponse = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_latitude: -16.5089,
      start_longitude: -41.7869,
      end_latitude: -18.2494,
      end_longitude: -43.6005,
      start_time: dayjs().toISOString(),
      price: 150.0,
      available_seats: 3,
      preferences: "Sem animais, por favor",
    },
  });
  const newRideId = JSON.parse(newRideResponse.body).ride_id;

  const newReservationResponse = await server.inject({
    method: "POST",
    url: `/reservations/${newRideId}`,
    headers: {
      Authorization: `Bearer ${newUserToken}`,
    },
  });
  const newReservationId = JSON.parse(
    newReservationResponse.body
  ).reservation_id;

  await server.inject({
    method: "POST",
    url: `/reservations/confirm/${newReservationId}`,
    headers: {
      Authorization: `Bearer ${newUserToken}`,
    },
  });

  const reservationResponse = await server.inject({
    method: "POST",
    url: `/reservations/${newRideId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  const reservationResponseId = JSON.parse(
    reservationResponse.body
  ).reservation_id;

  await server.inject({
    method: "POST",
    url: `/rides/start/${newRideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  const response = await server.inject({
    method: "POST",
    url: `/reservations/confirm/${reservationResponseId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Apenas corridas SCHEDULED podem ser processadas.");
});
