import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { models } from "../models";
import { geocodeCoordinates } from "../../services/location/geocodeCordinates";
import { sanitizeAddress } from "../../utils/sanitize";
import { CreateAddress } from "../../types";

export const createAddress = async (
  request: FastifyRequest<{ Body: CreateAddress }>,
  reply: FastifyReply
) => {
  const { latitude, longitude } = request.body;
  const userId = request.userData?.id;

  const user = await models.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return reply.status(404).send({ error: "Usuário não encontrado." });
  }

  if (!user.is_driver) {
    return reply
      .status(403)
      .send({ error: "Apenas motoristas podem salvar endereços." });
  }

  const addressCount = await models.address.count({
    where: { userId, deleted: false },
  });

  if (addressCount >= 4) {
    return reply
      .status(400)
      .send({ error: "Você só pode salvar até 4 endereços." });
  }

  const geocodedData = await geocodeCoordinates(latitude, longitude);

  if (!geocodedData) {
    return reply.status(400).send({
      error: "Não foi possível geocodificar as coordenadas fornecidas.",
    });
  }

  const newAddress = await models.address.create({
    data: {
      latitude,
      longitude,
      city: geocodedData.city,
      formattedAddress: geocodedData.formattedAddress,
      userId,
    },
  });

  return reply.status(201).send(sanitizeAddress(newAddress));
};
