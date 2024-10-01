import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import app from "../config/app";
import bcrypt from "bcrypt";

let server: FastifyInstance;
let userToken: string;
let userId: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  const userResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Test",
      last_name: "User",
      email: "testchangepassword@example.com",
      password: "OldPassword123!",
      phone_number: "1234567890",
    },
  });

  userId = JSON.parse(userResponse.body).id;

  const loginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "testchangepassword@example.com",
      password: "OldPassword123!",
    },
  });

  userToken = JSON.parse(loginResponse.body).token;
});

afterAll(async () => {
  await models.user.delete({ where: { id: userId } });
  await server.close();
});

test("Deve alterar a senha com sucesso", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/change-password",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword456!",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Senha alterada com sucesso.");

  const user = await models.user.findUnique({ where: { id: userId } });
  const isNewPasswordCorrect = await bcrypt.compare(
    "NewPassword456!",
    user!.password
  );
  expect(isNewPasswordCorrect).toBe(true);
});

test("Não deve alterar a senha com a senha atual incorreta", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/change-password",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      currentPassword: "WrongPassword123!",
      newPassword: "NewPassword789!",
    },
  });

  expect(response.statusCode).toBe(401);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Senha atual incorreta.");
});

test("Não deve alterar a senha sem autenticação", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/change-password",
    payload: {
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword789!",
    },
  });

  expect(response.statusCode).toBe(401);
});

test("Não deve alterar a senha com nova senha inválida", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/change-password",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      currentPassword: "NewPassword456!",
      newPassword: "weak",
    },
  });

  expect(response.statusCode).toBe(400);
});
