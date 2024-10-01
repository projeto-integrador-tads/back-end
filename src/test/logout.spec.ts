import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import app from "../config/app";
import { models } from "../models/models";

let server: FastifyInstance;
let userToken: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  const registerResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Teste",
      last_name: "Logout",
      email: "teste.logout@example.com",
      password: "Senha@123",
      phone_number: "1234567890",
    },
  });

  expect(registerResponse.statusCode).toBe(200);

  const loginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "teste.logout@example.com",
      password: "Senha@123",
    },
  });

  expect(loginResponse.statusCode).toBe(200);
  const loginBody = JSON.parse(loginResponse.body);
  userToken = loginBody.token;
});

afterAll(async () => {
  await models.token.deleteMany({});
  await models.user.deleteMany({});
  await server.close();
});

test("Deve fazer logout com sucesso", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/logout",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Logout feito com sucesso.");
});

test("Não deve fazer logout sem token de autenticação", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/logout",
  });

  expect(response.statusCode).toBe(401);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Você precisa estar logado para acessar a rota.");
});

test("Não deve fazer logout com token inválido", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/logout",
    headers: {
      Authorization: "Bearer token_invalido",
    },
  });

  expect(response.statusCode).toBe(401);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Você precisa estar logado para acessar a rota.");
});

test("Deve rejeitar acesso a rota protegida após logout", async () => {
  await server.inject({
    method: "POST",
    url: "/logout",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  const response = await server.inject({
    method: "GET",
    url: "/users/profile",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(401);
});

test("Deve permitir novo login após logout", async () => {
  await server.inject({
    method: "POST",
    url: "/logout",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  const loginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "teste.logout@example.com",
      password: "Senha@123",
    },
  });

  expect(loginResponse.statusCode).toBe(200);
  const loginBody = JSON.parse(loginResponse.body);
  expect(loginBody).toHaveProperty("token");
});
