import { expect, test, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import app from "../config/app";
import { models } from "../models/models";
import { dayjs } from "../utils/dayjs";

let server: FastifyInstance;
let userToken: string;
let driverToken: string;
let userId: string;
let driverId: string;
let vehicleId: string;
let rideId: string;
let reservationId: string;
let reviewId: string;

beforeAll(async () => {
  await app.ready();
  server = app;

  const userResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Passageiro",
      last_name: "Teste",
      email: "passageiro@teste.com",
      password: "Senha@123",
      phone_number: "1234567890",
    },
  });
  userId = JSON.parse(userResponse.body).id;

  const driverResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Motorista",
      last_name: "Teste",
      email: "motorista@teste.com",
      password: "Senha@123",
      phone_number: "0987654321",
    },
  });
  driverId = JSON.parse(driverResponse.body).id;

  const userLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "passageiro@teste.com",
      password: "Senha@123",
    },
  });
  userToken = JSON.parse(userLoginResponse.body).token;

  const driverLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "motorista@teste.com",
      password: "Senha@123",
    },
  });
  driverToken = JSON.parse(driverLoginResponse.body).token;

  const vehicleResponse = await server.inject({
    method: "POST",
    url: "/vehicles",
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
    payload: {
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      license_plate: "ABC1234",
      color: "Preto",
      seats: 4,
    },
  });
  vehicleId = JSON.parse(vehicleResponse.body).vehicle_id;

  const rideResponse = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_latitude: -18.2494,
      start_longitude: -43.6005,
      end_latitude: -16.8674,
      end_longitude: -42.0706,
      start_time: dayjs().toISOString(),
      price: 50.0,
      available_seats: 3,
      preferences: "Sem fumantes, por favor",
    },
  });
  rideId = JSON.parse(rideResponse.body).ride_id;

  const reservationResponse = await server.inject({
    method: "POST",
    url: `/reservations/${rideId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  reservationId = JSON.parse(reservationResponse.body).reservation_id;

  await server.inject({
    method: "POST",
    url: `/reservations/confirm/${reservationId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  await server.inject({
    method: "POST",
    url: `/rides/start/${rideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  await server.inject({
    method: "POST",
    url: `/rides/end/${rideId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });
});

afterAll(async () => {
  await models.review.deleteMany({});
  await models.reservation.deleteMany({});
  await models.ride.deleteMany({});
  await models.vehicle.deleteMany({});
  await models.user.deleteMany({});
  await server.close();
});

test("Deve criar uma avaliação com sucesso", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/reviews",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      ride_id: rideId,
      rating: 5,
      comment: "Ótima viagem!",
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(response.body);
  expect(body).toHaveProperty("review_id");
  reviewId = body.review_id;
});

test("Não deve criar uma avaliação para uma corrida não finalizada", async () => {
  const newRideResponse = await server.inject({
    method: "POST",
    url: "/rides",
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
    payload: {
      vehicle_id: vehicleId,
      start_latitude: -18.2494,
      start_longitude: -43.6005,
      end_latitude: -16.8674,
      end_longitude: -42.0706,
      start_time: dayjs().add(3, "hour").toISOString(),
      price: 60.0,
      available_seats: 3,
      preferences: "Sem animais, por favor",
    },
  });

  const newRideId = JSON.parse(newRideResponse.body).ride_id;

  const response = await server.inject({
    method: "POST",
    url: "/reviews",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      ride_id: newRideId,
      rating: 4,
      comment: "Boa viagem!",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("A corrida não foi finalizada.");
});

test("Não deve criar uma avaliação para uma corrida que o usuário não participou", async () => {
  const newUserResponse = await server.inject({
    method: "POST",
    url: "/register",
    payload: {
      name: "Outro",
      last_name: "Usuário",
      email: "outro@teste.com",
      password: "Senha@123",
      phone_number: "1122334455",
    },
  });
  const newUserId = JSON.parse(newUserResponse.body).id;

  const newUserLoginResponse = await server.inject({
    method: "POST",
    url: "/login",
    payload: {
      email: "outro@teste.com",
      password: "Senha@123",
    },
  });
  const newUserToken = JSON.parse(newUserLoginResponse.body).token;

  const response = await server.inject({
    method: "POST",
    url: "/reviews",
    headers: {
      Authorization: `Bearer ${newUserToken}`,
    },
    payload: {
      ride_id: rideId,
      rating: 3,
      comment: "Viagem regular",
    },
  });

  expect(response.statusCode).toBe(403);
  const body = JSON.parse(response.body);
  expect(body.error).toBe(
    "Você não participou desta corrida ou sua reserva não foi confirmada."
  );
});

test("Não deve criar uma avaliação duplicada", async () => {
  const response = await server.inject({
    method: "POST",
    url: "/reviews",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      ride_id: rideId,
      rating: 5,
      comment: "Outra ótima viagem!",
    },
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Você já avaliou esta corrida.");
});

test("Deve atualizar uma avaliação", async () => {
  const response = await server.inject({
    method: "PUT",
    url: `/reviews/${reviewId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    payload: {
      rating: 4,
      comment: "Viagem boa, mas pode melhorar",
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.rating).toBe(4);
  expect(body.comment).toBe("Viagem boa, mas pode melhorar");
});

test("Não deve atualizar uma avaliação de outro usuário", async () => {
  const response = await server.inject({
    method: "PUT",
    url: `/reviews/${reviewId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
    payload: {
      rating: 3,
      comment: "Tentativa de alteração indevida",
    },
  });

  expect(response.statusCode).toBe(403);
  const body = JSON.parse(response.body);
  expect(body.error).toBe(
    "Você não tem permissão para atualizar esta avaliação."
  );
});

test("Deve excluir uma avaliação", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: `/reviews/${reviewId}`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  expect(response.statusCode).toBe(204);
});

test("Não deve excluir uma avaliação de outro usuário", async () => {
  const response = await server.inject({
    method: "DELETE",
    url: `/reviews/${reviewId}`,
    headers: {
      Authorization: `Bearer ${driverToken}`,
    },
  });

  expect(response.statusCode).toBe(404);
  const body = JSON.parse(response.body);
  expect(body.error).toBe("Avaliação não encontrada.");
});
