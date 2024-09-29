import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import app from "../config/app";
import { dayjs } from "../utils/dayjs";
import { models } from "../models/models";
import { RideStatus, ReservationStatus } from "../utils/constants";

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
      name: "Passageiro",
      last_name: "Teste",
      email: "passageiro@teste.com",
      password: "Senha@123",
      phone_number: "1234567890",
    },
  });
  userId = JSON.parse(userResponse.body).id;

  const driverResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Motorista",
      last_name: "Teste",
      email: "motorista@teste.com",
      password: "Senha@123",
      phone_number: "0987654321",
    },
  });
  driverId = JSON.parse(driverResponse.body).id;

  const userLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "passageiro@teste.com",
      password: "Senha@123",
    },
  });
  userToken = JSON.parse(userLoginResponse.body).token;

  const driverLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "motorista@teste.com",
      password: "Senha@123",
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
      start_time: dayjs().toISOString(),
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

  await server.inject({
    method: "POST",
    url: `/reservations/confirm/${reservationId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  await server.inject({
    method: "POST",
    url: `/rides/start/${rideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });
});

afterAll(async () => {
  await models.reservation.deleteMany({});
  await models.ride.deleteMany({});
  await models.vehicle.deleteMany({});
  await models.user.deleteMany({});
  await server.close();
});

test("Deve finalizar uma corrida com sucesso", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/rides/end/${rideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.status).toBe(RideStatus.COMPLETED);
});

test("Não deve finalizar uma corrida que não está em andamento", async () => {
  const newRideResponse = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_latitude: -16.8674,
      start_longitude: -42.0706,
      end_latitude: -17.8571,
      end_longitude: -41.5064,
      start_time: dayjs().add(2, "hour").toISOString(),
      price: 100.0,
      available_seats: 3,
      preferences: "Sem animais, por favor",
    },
  });
  const newRideId = JSON.parse(newRideResponse.body).ride_id;

  const response = await server.inject({
    method: "POST",
    url: `/rides/end/${newRideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Apenas corridas IN_PROGRESS podem ser processadas.");
});

test("Não deve finalizar uma corrida que não pertence ao motorista", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/rides/end/${rideId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe(
    "Você não tem permissão para atualizar esta corrida."
  );
});

test("Não deve finalizar uma corrida inexistente", async () => {
  const fakeRideId = "00000000-0000-0000-0000-000000000000";
  const response = await server.inject({
    method: "POST",
    url: `/rides/end/${fakeRideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Corrida não encontrada.");
});
