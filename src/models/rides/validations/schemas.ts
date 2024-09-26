import { z } from "zod";

export const createRideSchema = z
  .object({
    vehicle_id: z.string().uuid(),
    start_location_id: z.string().uuid().optional(),
    end_location_id: z.string().uuid().optional(),
    start_latitude: z.number().optional(),
    start_longitude: z.number().optional(),
    end_latitude: z.number().optional(),
    end_longitude: z.number().optional(),
    start_time: z.coerce.date({ message: "Digite uma data válida." }),
    price: z.number().positive(),
    available_seats: z
      .number()
      .int()
      .positive()
      .min(1, "A corrida deve conter pelo menos um assento disponível.")
      .max(50, "Não é possível adicionar mais de 50 pessoas."),
    preferences: z.string(),
  })
  .refine(
    (data) =>
      (data.start_location_id ||
        (data.start_latitude && data.start_longitude)) &&
      (data.end_location_id || (data.end_latitude && data.end_longitude)),
    {
      message:
        "Informe o ID ou as coordenadas para os endereços de partida e destino.",
    }
  );

export const updateRideSchema = z.object({
  ride_id: z.string().uuid("ID da corrida inválido."),
  start_location_id: z.string().uuid().optional(),
  end_location_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
  start_latitude: z.number().optional(),
  start_longitude: z.number().optional(),
  end_latitude: z.number().optional(),
  end_longitude: z.number().optional(),
  start_time: z.coerce.date().optional(),
  price: z.number().positive().optional(),
  available_seats: z
    .number()
    .int()
    .positive()
    .min(1, "A corrida deve conter pelo menos um assento disponível.")
    .max(50, "Não é possível adicionar mais de 50 pessoas.")
    .optional(),
  preferences: z.string().optional(),
});

export const rideIdSchema = z.object({
  rideId: z.string().uuid(),
});

export const searchRideByCitySchema = z.object({
  city: z.string().uuid(),
});
