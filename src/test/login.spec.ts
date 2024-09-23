import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import bcrypt from "bcrypt";
import app from "../config/app";

let server: FastifyInstance;

beforeAll(async () => {
  await app.ready();
  server = app;

  const hashedPassword = await bcrypt.hash("TestPassword123!", 12);
  await models.user.create({
    data: {
      name: "Teste",
      last_name: "Usuário",
      email: "testlogin@example.com",
      password: hashedPassword,
      phone_number: "1234567890",
    },
  });
});

afterAll(async () => {
  await models.user.deleteMany({
    where: {
      email: "testlogin@example.com",
    },
  });
  await server.close();
});

test("Deve realizar login com sucesso", async () => {
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
  await models.user.update({
    where: { email: "testlogin@example.com" },
    data: { active: false },
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

  const user = await models.user.findUnique({
    where: { email: "testlogin@example.com" },
  });
  expect(user?.active).toBe(true);
});
