import { Prisma } from "@prisma/client";
import { models } from "../../models/models";
import { FastifyReply, FastifyRequest } from "fastify";
import { VehicleRequestBody } from "../../types";
import { handleValidationError } from "../../exeptions/handleValidationError";

export const registerVehicle = async (
  request: FastifyRequest<{ Body: VehicleRequestBody }>,
  reply: FastifyReply
) => {
  const {
    license_plate: licensePlate,
    brand,
    model,
    year,
    color,
    seats,
  } = request.body;
  const ownerId = request.userData?.id;

  if (!ownerId) {
    throw new Error();
  }

  try {
    const owner = await models.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      return reply.status(404).send({ error: "Proprietário não encontrado." });
    }

    const vehicle = await models.vehicle.create({
      data: {
        owner_id: ownerId,
        brand,
        model,
        year,
        license_plate: licensePlate.toUpperCase(),
        color,
        seats,
      },
    });

    await models.user.update({
      where: {
        id: ownerId,
      },
      data: {
        is_driver: true,
      },
    });

    return reply.status(201).send({ vehicle_id: vehicle.vehicle_id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return reply.status(409).send({ error: "Placa já registrada." });
    }
    handleValidationError(error, reply);
    return reply.status(500).send({ error: "Erro interno do servidor." });
  }
};
