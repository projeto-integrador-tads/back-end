import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import app from "../config/app";
import { randomUUID } from "crypto";

let server: FastifyInstance;
let userToken: string;
let userId: string;
let vehicleId: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  await models.user.deleteMany({
    where: {
      email: "testdriver@example.com",
    },
  });

  const user = await models.user.create({
    data: {
      name: "Teste",
      last_name: "Motorista",
      email: "testdriver@example.com",
      password: "senha@CERTAMENTE@segura",
      phone_number: "1234567890",
    },
  });

  userId = user.id;

  userToken = app.jwt.sign({
    email: user.email,
    firstName: user.name,
    lastName: user.last_name,
    id: user.id,
  });
});

afterAll(async () => {
  if (userId) {
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
  }
  await server.close();
});

test("Deve registrar um novo veículo", async () => {
  const response = await server.inject({
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
      document: "documento_veiculo.pdf",
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("vehicle_id");
  vehicleId = body.vehicle_id;
});

test("Não deve registrar um veículo com dados inválidos", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/vehicles",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      brand: "T",
      model: "C",
      year: 1899,
      license_plate: "INVALIDO",
      color: "",
      seats: 0,
      document: "",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("error");
});

test("Não deve registrar um veículo com uma placa já existente", async () => {
  await server.inject({
    method: "POST",
    url: "/vehicles",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      brand: "Honda",
      model: "Civic",
      year: 2021,
      license_plate: "XYZ5678",
      color: "Vermelho",
      seats: 4,
      document: "outro_documento.pdf",
    },
  });

  const response = await server.inject({
    method: "POST",
    url: "/vehicles",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      brand: "Ford",
      model: "Focus",
      year: 2020,
      license_plate: "XYZ5678",
      color: "Verde",
      seats: 4,
      document: "mais_um_documento.pdf",
    },
  });

  expect(response.statusCode).toBe(409);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Placa já registrada.");
});

test("Não deve registrar um veículo sem autenticação", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/vehicles",
    payload: {
      brand: "Chevrolet",
      model: "Cruze",
      year: 2023,
      license_plate: "DEF5678",
      color: "Prata",
      seats: 4,
      document: "novo_documento.pdf",
    },
  });

  expect(response.statusCode).toBe(401);
});

test("Deve atualizar o usuário para is_driver após registrar o primeiro veículo", async () => {
  await server.inject({
    method: "POST",
    url: "/vehicles",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      brand: "Volkswagen",
      model: "Golf",
      year: 2022,
      license_plate: "GHI9012",
      color: "Preto",
      seats: 4,
      document: "vw_documento.pdf",
    },
  });

  const updatedUser = await models.user.findUnique({
    where: { id: userId },
  });

  expect(updatedUser?.is_driver).toBe(true);
});

test("Deve listar veículos ativos do usuário", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/vehicles/active",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data.length).toBeGreaterThan(0);
});

test("Deve listar veículos inativos do usuário", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/vehicles/inactive",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(Array.isArray(body.data)).toBe(true);
});

test("Deve atualizar um veículo", async () => {
  const response = await server.inject({
    method: "PUT",
    url: `/vehicles`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      color: "Verde",
      seats: 5,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.color).toBe("Verde");
  expect(body.seats).toBe(5);
});

test("Não deve atualizar um veículo que não pertence ao usuário", async () => {
  const response = await server.inject({
    method: "PUT",
    url: `/vehicles/${randomUUID()}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      color: "Amarelo",
      seats: 3,
    },
  });

  expect(response.statusCode).toBe(404);
});

test("Deve desativar (deletar) um veículo", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: `/vehicles/${vehicleId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(204);
});

test("Não deve desativar um veículo que não pertence ao usuário", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: `/vehicles/${randomUUID()}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(404);
});

test("Deve reativar um veículo", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/vehicles/reactivate/${vehicleId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.active).toBe(true);
});

test("Não deve reativar um veículo que não pertence ao usuário", async () => {
  const response = await server.inject({
    method: "POST",
    url: `/vehicles/reactivate/${randomUUID()}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(404);
});

test("Deve atualizar o usuário para is_driver false quando o último veículo ativo é desativado", async () => {
  await models.vehicle.deleteMany({
    where: { owner_id: userId },
  });

  const vehicle = await models.vehicle.create({
    data: {
      owner_id: userId,
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      license_plate: "ABC1234",
      color: "Azul",
      seats: 4,
      document: "documento_veiculo.pdf",
    },
  });

  const response = await server.inject({
    method: "DELETE",
    url: `/vehicles/${vehicle.vehicle_id}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(204);
  const updatedUser = await models.user.findUnique({
    where: { id: userId },
  });

  expect(updatedUser?.is_driver).toBe(false);
});
