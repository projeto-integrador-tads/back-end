import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import app from "../config/app";

let server: FastifyInstance;
let userToken: string;
let userId: string;
let addressId: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  // Registrar um usuário
  const registerResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Teste",
      last_name: "Motorista",
      email: "testemotorista@example.com",
      password: "SenhaTest123!",
      phone_number: "1234567890",
    },
  });

  expect(registerResponse.statusCode).toBe(200);
  const registerBody = JSON.parse(registerResponse.body);
  userId = registerBody.id;

  // Fazer login para obter o token
  const loginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "testemotorista@example.com",
      password: "SenhaTest123!",
    },
  });

  expect(loginResponse.statusCode).toBe(200);
  const loginBody = JSON.parse(loginResponse.body);
  userToken = loginBody.token;

  // Tornar o usuário um motorista
  await server.inject({
    method: "POST",
    url: "/vehicles",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      license_plate: "ABC1234",
      color: "Azul",
      seats: 4,
    },
  });
});

afterAll(async () => {
  await models.address.deleteMany({
    where: {
      userId,
    },
  });
  await models.vehicle.deleteMany({
    where: {
      owner_id: userId,
    },
  });
  await models.user.delete({
    where: {
      id: userId,
    },
  });
  await server.close();
});

test("Deve criar um novo endereço", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/address",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      latitude: -18.2494,
      longitude: -43.6005,
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("id");
  expect(body.latitude).toBe(-18.2494);
  expect(body.longitude).toBe(-43.6005);
  addressId = body.id;
});

test("Não deve criar um endereço para um usuário não motorista", async () => {
  const registerResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Não",
      last_name: "Motorista",
      email: "naomotorista@example.com",
      password: "SenhaTest123!",
      phone_number: "9876543210",
    },
  });

  const nonDriverId = JSON.parse(registerResponse.body).id;

  const loginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "naomotorista@example.com",
      password: "SenhaTest123!",
    },
  });

  const nonDriverToken = JSON.parse(loginResponse.body).token;

  const response = await server.inject({
    method: "POST",
    url: "/address",
    headers: {
      Authorization: `Bearer ${nonDriverToken}`,
    },
    payload: {
      latitude: -18.2494,
      longitude: -43.6005,
    },
  });

  expect(response.statusCode).toBe(403);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Apenas motoristas podem salvar endereços.");

  await models.user.delete({
    where: {
      id: nonDriverId,
    },
  });
});

test("Não deve criar mais de 4 endereços", async () => {
  for (let i = 0; i < 3; i++) {
    await server.inject({
      method: "POST",
      url: "/address",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      payload: {
        latitude: -18.2494 + i * 0.1,
        longitude: -43.6005 + i * 0.1,
      },
    });
  }

  const response = await server.inject({
    method: "POST",
    url: "/address",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      latitude: -18.5494,
      longitude: -43.9005,
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Você só pode salvar até 4 endereços.");
});

test("Deve obter os endereços salvos", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/user/address",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeLessThanOrEqual(4);
});

test("Deve obter um endereço específico pelo ID", async () => {
  const response = await server.inject({
    method: "GET",
    url: `/address/${addressId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.id).toBe(addressId);
});

test("Deve excluir um endereço", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: `/address/${addressId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(204);

  const getResponse = await server.inject({
    method: "GET",
    url: `/address/${addressId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(getResponse.statusCode).toBe(404);
});

test("Não deve excluir um endereço inexistente", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: `/address/${crypto.randomUUID()}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(404);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Endereço não encontrado.");
});
