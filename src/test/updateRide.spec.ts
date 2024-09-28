import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import app from "../config/app";
import { dayjs } from "../utils/dayjs";

let server: FastifyInstance;
let userToken: string;
let userId: string;
let vehicleId: string;
let ride_id: string;
let startAddressId: string;
let endAddressId: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  const user = await models.user.create({
    data: {
      name: "João",
      last_name: "Silva",
      email: "joao.silvq3a@example.com",
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

  const randomlicense_plate = `ABC${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;

  const vehicle = await models.vehicle.create({
    data: {
      owner_id: userId,
      brand: "Fiat",
      model: "Uno",
      year: 2010,
      license_plate: randomlicense_plate,
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

  const ride = await models.ride.create({
    data: {
      driver_id: userId,
      vehicle_id: vehicleId,
      start_address_id: startAddressId,
      end_address_id: endAddressId,
      start_time: dayjs().add(24, "hour").toISOString(),
      price: 50.0,
      available_seats: 3,
      preferences: "Sem fumantes, por favor",
      status: "SCHEDULED",
    },
  });

  ride_id = ride.ride_id;
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

test("Deve atualizar uma corrida com sucesso", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      ride_id: ride_id,
      price: 60.0,
      available_seats: 2,
      preferences: "Ar condicionado ligado",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.price).toBe("60");
  expect(body.available_seats).toBe(2);
  expect(body.preferences).toBe("Ar condicionado ligado");
});

test("Deve atualizar o endereço de destino da corrida", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      ride_id: ride_id,
      end_latitude: -17.8571,
      end_longitude: -41.5064,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.end_address_id).not.toBe(endAddressId);
});

test("Não deve atualizar uma corrida com data no passado", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      ride_id: ride_id,
      start_time: dayjs().subtract(1, "hour").toISOString(),
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("O horário de saída não pode estar no passado.");
});

test("Não deve atualizar uma corrida com endereços muito próximos", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      ride_id: ride_id,
      start_latitude: -18.2494,
      start_longitude: -43.6005,
      end_latitude: -18.2495,
      end_longitude: -43.6006,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe(
    "A distância entre o ponto de partida e o ponto de chegada deve ser de pelo menos 500 metros."
  );
});

test("Não deve atualizar uma corrida de outro motorista", async () => {
  const otherUser = await models.user.create({
    data: {
      name: "Maria",
      last_name: "Santos",
      email: "maria.santos@example.com",
      password: "Senha@456",
      phone_number: "3377776666",
      is_driver: true,
    },
  });

  const otherUserToken = app.jwt.sign({
    email: otherUser.email,
    firstName: otherUser.name,
    lastName: otherUser.last_name,
    id: otherUser.id,
  });

  const response = await server.inject({
    method: "PUT",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${otherUserToken}`,
    },
    payload: {
      ride_id: ride_id,
      price: 70.0,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe(
    "Você não tem permissão para atualizar esta corrida."
  );

  await models.user.delete({
    where: {
      id: otherUser.id,
    },
  });
});
