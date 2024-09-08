import { Prisma } from "@prisma/client";
import { vehicleSchema } from "../../utils/schemas";
import { models } from "../../models/models";
import { FastifyReply, FastifyRequest } from "fastify";
import { TypeOf } from "zod";

type VehicleRequestBody = TypeOf<typeof vehicleSchema>;

export const registerVehicle = async (
  request: FastifyRequest<{ Body: VehicleRequestBody }>,
  response: FastifyReply
) => {
  const { brand, model, year, license_plate, color, seats, document } =
    request.body;

  const owner_id = request.userData?.id;

  if (!owner_id) {
    throw new Error();
  }

  try {
    const owner = await models.user.findUnique({
      where: { id: owner_id },
    });

    if (!owner) {
      return response
        .status(404)
        .send({ error: "Proprietário não encontrado." });
    }

    const vehicle = await models.vehicle.create({
      data: {
        owner_id,
        brand,
        model,
        year,
        license_plate: license_plate.toUpperCase(),
        color,
        seats,
        document,
      },
    });

    await models.user.update({
      where: {
        id: owner_id,
      },
      data: {
        is_driver: true,
      },
    });

    return response.status(201).send({ vehicle_id: vehicle.vehicle_id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return response.status(409).send({ error: "Placa já registrada." });
    }
    return response.status(500).send({ error: "Erro interno do servidor." });
  }
};
