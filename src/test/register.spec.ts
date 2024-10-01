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
  await models.user.deleteMany({
    where: {
      email: "test@example.com",
    },
  });
  await server.close();
});

test("Deve registrar um novo usuário", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Teste",
      last_name: "Fulano Santos",
      email: "test@example.com",
      password: "TestPassword123!",
      phone_number: "33912344567",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("id");
  expect(body.name).toBe("Teste");
  expect(body.last_name).toBe("Fulano Santos");
  expect(body.email).toBe("test@example.com");
  expect(body.phone_number).toBe("33912344567");
  expect(body).not.toHaveProperty("password");
});

test("Não deve registrar um usuário com um email existente", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Outro",
      last_name: "Usuário",
      email: "test@example.com",
      password: "OutraSenha123!",
      phone_number: "9876543210",
    },
  });

  expect(response.statusCode).toBe(409);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("O email já existe.");
});

test("Não deve registrar um usuário com dados inválidos", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "In",
      last_name: "Válido",
      email: "email-invalido",
      password: "fraco",
      phone_number: "123",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("error");
});
