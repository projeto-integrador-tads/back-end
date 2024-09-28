import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import app from "../config/app";
import { dayjs } from "../utils/dayjs";
import { models } from "../models/models";

let server: FastifyInstance;
let userToken: string;
let driverToken: string;
let userId: string;
let driverId: string;
let vehicleId: string;
let ride_id: string;

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
  ride_id = JSON.parse(rideResponse.body).ride_id;
});

afterAll(async () => {
  await models.reservation.deleteMany({
    where: {
      OR: [{ passenger_id: userId }, { Ride: { driver_id: driverId } }],
    },
  });
  await models.ride.deleteMany({
    where: {
      OR: [{ driver_id: driverId }, { Vehicle: { owner_id: driverId } }],
    },
  });
  await models.vehicle.deleteMany({
    where: {
      owner_id: driverId,
    },
  });
  await models.address.deleteMany({
    where: {
      OR: [{ userId: userId }, { userId: driverId }, { userId: null }],
    },
  });
  await models.user.deleteMany({
    where: {
      OR: [{ id: userId }, { id: driverId }],
    },
  });

  await server.close();
});

test("Deve listar as corridas do motorista", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/rides/driver",
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.data).toBeInstanceOf(Array);
  expect(body.data.length).toBeGreaterThan(0);
  expect(body.data[0]).toHaveProperty("ride_id", ride_id);
});

test("Deve listar as corridas por cidade de partida", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/rides/start-city/Diamantina",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.data).toBeInstanceOf(Array);
  expect(body.data.length).toBeGreaterThan(0);
  expect(body.data[0].StartAddress.city).toBe("Diamantina");
});

test("Deve listar as corridas por cidade de destino", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/rides/destination-city/Araçuaí",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.data).toBeInstanceOf(Array);
  expect(body.data.length).toBeGreaterThan(0);
  expect(body.data[0].EndAddress.city).toBe("Araçuaí");
});

test("Deve obter os detalhes de uma corrida específica", async () => {
  const response = await server.inject({
    method: "GET",
    url: `/rides/${ride_id}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("ride_id", ride_id);
  expect(body).toHaveProperty("StartAddress");
  expect(body).toHaveProperty("EndAddress");
});

test("Não deve listar corridas para um usuário não autenticado", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/rides/driver",
  });

  expect(response.statusCode).toBe(401);
});

test("Não deve obter detalhes de uma corrida inexistente", async () => {
  const response = await server.inject({
    method: "GET",
    url: `/rides/${crypto.randomUUID()}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Corrida não encontrada.");
});
