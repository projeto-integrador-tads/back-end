import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import app from "../config/app";

let server: FastifyInstance;

beforeAll(async () => {
  await app.ready();
  server = app;
});

afterAll(async () => {
  await models.user.deleteMany({});
  await server.close();
});

test("Deve realizar login com sucesso", async () => {
  // Registrar um usuário
  await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Teste",
      last_name: "Usuário",
      email: "testlogin@example.com",
      password: "TestPassword123!",
      phone_number: "1234567890",
    },
  });

  const response = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "testlogin@example.com",
      password: "TestPassword123!",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("token");
});

test("Não deve realizar login com senha incorreta", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "testlogin@example.com",
      password: "SenhaErrada123!",
    },
  });

  expect(response.statusCode).toBe(401);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("error", "Senha incorreta.");
});

test("Não deve realizar login com usuário inexistente", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "naoexiste@example.com",
      password: "AlgumaSenha123!",
    },
  });

  expect(response.statusCode).toBe(401);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("error", "Usuário não encontrado.");
});

test("Deve reativar um usuário inativo após login bem-sucedido", async () => {
  // Registrar um novo usuário
  const registerResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Usuário",
      last_name: "Inativo",
      email: "inativo@example.com",
      password: "SenhaInativa123!",
      phone_number: "9876543210",
    },
  });

  const userId = JSON.parse(registerResponse.body).id;

  // Fazer login para obter o token
  const loginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "inativo@example.com",
      password: "SenhaInativa123!",
    },
  });

  const token = JSON.parse(loginResponse.body).token;

  // Desativar a conta do usuário
  await server.inject({
    method: "DELETE",
    url: "/users",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Tentar fazer login com a conta desativada
  const reactivationLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "inativo@example.com",
      password: "SenhaInativa123!",
    },
  });

  expect(reactivationLoginResponse.statusCode).toBe(200);
  const reactivationBody = JSON.parse(reactivationLoginResponse.body);
  expect(reactivationBody).toHaveProperty("token");

  // Verificar se a conta foi reativada
  const userResponse = await server.inject({
    method: "GET",
    url: `/users/${userId}`,
    headers: {
      Authorization: `Bearer ${reactivationBody.token}`,
    },
  });

  const userData = JSON.parse(userResponse.body);
  expect(userData.active).toBe(true);
});
