import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import app from "../config/app";
import { dayjs } from "../utils/dayjs";

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
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      license_plate: "ABC1234",
      color: "Preto",
      seats: 4,
      document: "documento_veiculo.pdf",
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
      start_latitude: -18.2494,
      start_longitude: -43.6005,
      end_latitude: -16.8674,
      end_longitude: -42.0706,
      start_time: dayjs().add(24, "hour").toISOString(),
      price: 50.0,
      available_seats: 3,
      preferences: "Sem fumantes, por favor",
    },
  });
  rideId = JSON.parse(rideResponse.body).ride_id;
});

afterAll(async () => {
  await models.reservation.deleteMany({});
  await models.ride.deleteMany({});
  await models.vehicle.deleteMany({});
  await models.user.deleteMany({});
  await server.close();
});

test("Deve criar uma nova reserva", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/reservations/${rideId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("reservation_id");
  reservationId = body.reservation_id;
});

test("Não deve criar uma reserva para uma corrida inexistente", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/reservations/${crypto.randomUUID()}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Corrida não encontrada.");
});

test("Não deve criar uma reserva se o usuário for o motorista da corrida", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/reservations/${rideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe(
    "Não é possível pegar carona em uma corrida criada por você."
  );
});

test("Deve listar as reservas do usuário", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/reservations/users",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.data).toBeInstanceOf(Array);
  expect(body.data.length).toBeGreaterThan(0);
});

test("Deve listar as reservas de uma corrida específica", async () => {
  const response = await server.inject({
    method: "GET",
    url: `/reservations/rides/${rideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.data).toBeInstanceOf(Array);
  expect(body.data.length).toBeGreaterThan(0);
});

test("Deve listar as reservas confirmadas de uma corrida", async () => {
  const response = await server.inject({
    method: "GET",
    url: `/reservations/rides/${rideId}/confirmed`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.data).toBeInstanceOf(Array);
});

test("Deve cancelar uma reserva", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/reservations/cancel/${reservationId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Reserva cancelada com sucesso.");
});

test("Não deve cancelar uma reserva de outro usuário", async () => {
  const createResponse = await server.inject({
    method: "POST",
    url: `/reservations/${rideId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  expect(createResponse.statusCode).toBe(201);
  const newReservationId = JSON.parse(createResponse.body).reservation_id;

  const response = await server.inject({
    method: "POST",
    url: `/reservations/cancel/${newReservationId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Você não tem permissão para cancelar esta reserva.");
});
