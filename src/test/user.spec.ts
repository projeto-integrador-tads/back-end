import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { models } from "../models/models";
import app from "../config/app";
import bcrypt from "bcrypt";
import FormData from "form-data";
import sharp from "sharp";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../services/aws/s3";
import env from "../../env";

let server: FastifyInstance;
let userToken: string;
let userId: string;
let uploadedFileName: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  const hashedPassword = await bcrypt.hash("TestPassword123!", 12);
  const user = await models.user.create({
    data: {
      name: "Teste",
      last_name: "Usuário",
      email: "testuser@example.com",
      password: hashedPassword,
      phone_number: "1234567890",
    },
  });

  userId = user.id;

  userToken = server.jwt.sign({
    email: user.email,
    firstName: user.name,
    lastName: user.last_name,
    id: user.id,
  });
});

afterAll(async () => {
  await models.user.deleteMany({
    where: {
      email: {
        in: ["testuser@example.com", "test@example.com"],
      },
    },
  });

  if (uploadedFileName) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: uploadedFileName,
    });

    try {
      await s3.send(deleteCommand);
    } catch (error) {
      console.error("Erro ao deletar do S3:", error);
    }
  }

  await server.close();
});

test("Deve obter os dados do usuário", async () => {
  const response = await server.inject({
    method: "GET",
    url: `/users/${userId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.name).toBe("Teste");
  expect(body.last_name).toBe("Usuário");
  expect(body.email).toBe("testuser@example.com");
  expect(body.phone_number).toBe("1234567890");
});

test("Deve desativar a conta do usuário", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: `/users/${userId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(204);

  const user = await models.user.findUnique({
    where: { id: userId },
  });
  expect(user?.active).toBe(false);
});

test("Deve solicitar redefinição de senha", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/forgot-password",
    payload: {
      email: "testuser@example.com",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.message).toBe(
    "Código de recuperação de senha enviado com sucesso."
  );
});

test("Deve verificar o código de redefinição de senha", async () => {
  const passwordReset = await models.passwordResetToken.findUnique({
    where: { email: "testuser@example.com" },
  });

  const response = await server.inject({
    method: "POST",
    url: "/verify-reset-code",
    payload: {
      email: "testuser@example.com",
      resetCode: passwordReset?.resetCode,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Código verificado.");
});

test("Deve redefinir a senha do usuário", async () => {
  const passwordReset = await models.passwordResetToken.findUnique({
    where: { email: "testuser@example.com" },
  });

  const response = await server.inject({
    method: "POST",
    url: "/reset-password",
    payload: {
      email: "testuser@example.com",
      resetCode: passwordReset?.resetCode,
      newPassword: "NovaSenha@789",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Senha alterada com sucesso.");
});

test("Deve enviar uma foto de perfil", async () => {
  const imageBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .jpeg()
    .toBuffer();

  const form = new FormData();
  form.append("file", imageBuffer, {
    filename: "test-image.jpg",
    contentType: "image/jpeg",
  });

  const response = await server.inject({
    method: "POST",
    url: "/users/upload/img",
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${userToken}`,
    },
    payload: form.getBuffer(),
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Foto de perfil atualizada com sucesso!");

  uploadedFileName = `${userId}_profile_picture.jpg`;
});

test("Deve obter a URL da foto de perfil", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/users/profile-picture",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("url");
  expect(body.url).toMatch(/^https:\/\/.*\.amazonaws\.com\/.*/);
});

test("Deve remover a foto de perfil", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: "/users/profile-picture",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.message).toBe("Foto de perfil removida com sucesso!");
});

test("Deve atualizar o nome do usuário", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/users",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      name: "Updated",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.name).toBe("Updated");
});

test("Deve atualizar o sobrenome do usuário", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/users",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      last_name: "New Last Name",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.last_name).toBe("New Last Name");
});

test("Deve atualizar o número de telefone do usuário", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/users",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      phone_number: "9876543210",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.phone_number).toBe("9876543210");
});

test("Deve atualizar múltiplos campos do usuário", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/users",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      name: "Multi",
      last_name: "Update Test",
      phone_number: "1122334455",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.name).toBe("Multi");
  expect(body.last_name).toBe("Update Test");
  expect(body.phone_number).toBe("1122334455");
});

test("Não deve atualizar campos não permitidos", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/users",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      email: "newemail@example.com",
      password: "NewPassword123!",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBeTruthy();
});

test("Não deve atualizar com dados inválidos", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/users",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      name: "A",
      phone_number: "123",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBeTruthy();
});

test("Não deve atualizar sem autenticação", async () => {
  const response = await server.inject({
    method: "PUT",
    url: "/users",
    payload: {
      name: "Unauthorized",
    },
  });

  expect(response.statusCode).toBe(401);
});
