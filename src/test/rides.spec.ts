import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import app from "../config/app";
import { randomUUID } from "crypto";
import { dayjs } from "../utils/dayjs";

let server: FastifyInstance;
let userToken: string;
let userId: string;
let vehicleId: string;
let startAddressId: string;
let endAddressId: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  const user = await models.user.create({
    data: {
      name: "João",
      last_name: "Silva",
      email: "joao.silva@example.com",
      password: "Senha@123",
      phone_number: "3399998888",
      is_driver: true,
    },
  });

  userId = user.id;

  userToken = app.jwt.sign({
    email: user.email,
    firstName: user.name,
    lastName: user.last_name,
    id: user.id,
  });

  const vehicle = await models.vehicle.create({
    data: {
      owner_id: userId,
      brand: "Fiat",
      model: "Uno",
      year: 2010,
      license_plate: "ABC1234",
      color: "Branco",
      seats: 4,
    },
  });

  vehicleId = vehicle.vehicle_id;

  const startAddress = await models.address.create({
    data: {
      latitude: -18.2494,
      longitude: -43.6005,
      city: "Diamantina",
      formattedAddress: "Diamantina, MG",
    },
  });

  startAddressId = startAddress.id;

  const endAddress = await models.address.create({
    data: {
      latitude: -16.8674,
      longitude: -42.0706,
      city: "Araçuaí",
      formattedAddress: "Araçuaí, MG",
    },
  });

  endAddressId = endAddress.id;
});

afterAll(async () => {
  await models.ride.deleteMany({
    where: {
      driver_id: userId,
    },
  });
  await models.vehicle.deleteMany({
    where: {
      owner_id: userId,
    },
  });
  await models.address.deleteMany({
    where: {
      OR: [
        { id: startAddressId },
        { id: endAddressId },
        { userId: userId },
        { userId: null },
      ],
    },
  });
  await models.user.delete({
    where: {
      id: userId,
    },
  });
  await server.close();
});

test("Deve criar uma nova corrida com sucesso usando IDs de endereço", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_location_id: startAddressId,
      end_location_id: endAddressId,
      start_time: dayjs().add(24, "hour").toISOString(),
      price: 50.0,
      available_seats: 3,
      preferences: "Sem fumantes, por favor",
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("ride_id");
});

test("Deve criar uma nova corrida com sucesso usando coordenadas", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_latitude: -18.2494,
      start_longitude: -43.6005,
      end_latitude: -16.8674,
      end_longitude: -42.0706,
      start_time: dayjs().add(48, "hour").toISOString(),
      price: 60.0,
      available_seats: 2,
      preferences: "Ar condicionado ligado",
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("ride_id");
});

test("Não deve criar uma corrida com data no passado", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_location_id: startAddressId,
      end_location_id: endAddressId,
      start_time: dayjs().subtract(1, "hour").toISOString(),
      price: 30.0,
      available_seats: 2,
      preferences: "Música sertaneja",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("O horário de saída não pode estar no passado.");
});

test("Não deve criar uma corrida sem autenticação", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/rides",
    payload: {
      vehicle_id: vehicleId,
      start_location_id: startAddressId,
      end_location_id: endAddressId,
      start_time: dayjs().add(72, "hour").toISOString(),
      price: 40.0,
      available_seats: 4,
      preferences: "Ar condicionado ligado",
    },
  });

  expect(response.statusCode).toBe(401);
});

test("Não deve criar uma corrida com veículo inexistente", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      vehicle_id: randomUUID(),
      start_location_id: startAddressId,
      end_location_id: endAddressId,
      start_time: dayjs().add(96, "hour").toISOString(),
      price: 70.0,
      available_seats: 4,
      preferences: "Parada para almoço em Pedra Azul",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBeTruthy();
});

test("Não deve criar uma corrida com endereços muito próximos", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_latitude: -18.2494,
      start_longitude: -43.6005,
      end_latitude: -18.2495,
      end_longitude: -43.6006,
      start_time: dayjs().add(120, "hour").toISOString(),
      price: 80.0,
      available_seats: 3,
      preferences: "Viagem curta",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe(
    "A distância entre o ponto de partida e o ponto de chegada deve ser de pelo menos 500 metros."
  );
});

test("Não deve criar uma corrida se o usuário não for motorista", async () => {
  const nonDriverUser = await models.user.create({
    data: {
      name: "Maria",
      last_name: "Santos",
      email: "maria.santos@example.com",
      password: "Senha@456",
      phone_number: "3377776666",
      is_driver: false,
    },
  });

  const nonDriverToken = app.jwt.sign({
    email: nonDriverUser.email,
    firstName: nonDriverUser.name,
    lastName: nonDriverUser.last_name,
    id: nonDriverUser.id,
  });

  const response = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${nonDriverToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_location_id: startAddressId,
      end_location_id: endAddressId,
      start_time: dayjs().add(144, "hour").toISOString(),
      price: 90.0,
      available_seats: 2,
      preferences: "Viagem tranquila",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Usuário inválido ou não é um motorista ativo.");

  await models.user.delete({
    where: {
      id: nonDriverUser.id,
    },
  });
});
