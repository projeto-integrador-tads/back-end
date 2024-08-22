import { z } from "zod";
import { phoneRegex, plateRegex } from "./regex";

export const userSchema = z.object({
  name: z.string().min(3, "Nome inválido."),
  last_name: z.string().min(3, "Sobrenome inválido."),
  email: z.string().email("Email em formato inválido."),
  password: z
    .string()
    .min(8, "A senha precisa conter pelo menos 8 caracteres."),
  phone_number: z
    .string()
    .regex(phoneRegex, { message: "Número inválido." })
    .optional(),
});

export const vehicleSchema = z.object({
  owner_id: z.string().uuid("ID do proprietário inválido."),
  brand: z.string().min(1).max(50, "Marca deve ter no máximo 50 caracteres."),
  model: z.string().min(1).max(50, "Modelo deve ter no máximo 50 caracteres."),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  license_plate: z
    .string()
    .regex(plateRegex, "Placa inválida. Formato esperado: ABC1D23"),
  color: z.string().min(1).max(30, "Cor deve ter no máximo 30 caracteres."),
  seats: z.number().int().min(1).max(50),
  document: z.string().min(1, "Documento é obrigatório."),
});

export const createRideSchema = z.object({
  user_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  start_location: z.string(),
  end_location: z.string(),
  start_time: z.coerce.date({ message: "Digite uma data válida." }),
  price: z.number().positive(),
  available_seats: z
    .number()
    .int()
    .positive()
    .min(1, "A corrida deve conter pelo menos um assento disponível.")
    .max(50, "Não é possível adicionar mais de 50 pessoas."),
  preferences: z.string(),
});

export const createReservationSchema = z.object({
  ride_id: z.string().uuid(),
  passenger_id: z.string().uuid(),
});

export const updateRideSchema = z.object({
  ride_id: z.string().uuid("ID da corrida inválido."),
  driver_id: z.string().uuid("ID da corrida inválido."),
  start_location: z.string().optional(),
  end_location: z.string().optional(),
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
