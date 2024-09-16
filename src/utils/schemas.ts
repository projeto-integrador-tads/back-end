import { z } from "zod";
import { password, phone, plate } from "./regex";

export const userSchema = z.object({
  name: z.string().min(3, "Nome inválido."),
  last_name: z.string().min(3, "Sobrenome inválido."),
  email: z.string().email("Email em formato inválido."),
  password: z
    .string()
    .regex(password, {
      message:
        "A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e pode conter caracteres especiais.",
    })
    .min(8, "A senha precisa conter pelo menos 8 caracteres."),
  phone_number: z
    .string()
    .regex(phone, { message: "Número inválido." })
    .optional(),
});

export const vehicleSchema = z.object({
  brand: z.string().min(1).max(50, "Marca deve ter no máximo 50 caracteres."),
  model: z.string().min(1).max(50, "Modelo deve ter no máximo 50 caracteres."),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  license_plate: z
    .string()
    .regex(plate, "Placa inválida. Formato esperado: ABC1D23"),
  color: z.string().min(1).max(30, "Cor deve ter no máximo 30 caracteres."),
  seats: z.number().int().min(1).max(50),
  document: z.string().min(1, "Documento é obrigatório."),
});

export const createRideSchema = z
  .object({
    vehicle_id: z.string().uuid(),
    start_location_id: z.string().uuid().optional(),
    end_location_id: z.string().uuid().optional(),
    start_location: z.string().optional(),
    end_location: z.string().optional(),
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
  .refine((data) => data.start_location_id || data.start_location, {
    message: "Informe o ID ou o endereço de partida.",
    path: ["start_location"],
  })
  .refine((data) => data.end_location_id || data.end_location, {
    message: "Informe o ID ou o endereço de destino.",
    path: ["end_location"],
  });

export const createReservationSchema = z.object({
  ride_id: z.string().uuid(),
});

export const updateRideSchema = z.object({
  ride_id: z.string().uuid("ID da corrida inválido."),
  start_location_id: z.string().uuid().optional(),
  end_location_id: z.string().uuid().optional(),
  vehicle_id: z.string().uuid().optional(),
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

export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(8, { message: "A senha precisa conter pelo menos 8 caracteres." }),
});

export const cancelRideSchema = z.object({
  ride_id: z.string().uuid(),
});

export const deleteVehicleSchema = z.object({
  vehicle_id: z.string().uuid("ID do veículo deve ser um UUID válido"),
});

export const reactivateVehicleSchema = z.object({
  vehicle_id: z.string(),
});

export const createReviewSchema = z.object({
  ride_id: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email em formato inválido."),
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email("Email em formato inválido."),
  resetCode: z.string().length(6, "O código de redefinição deve ter 6 dígitos."),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email em formato inválido."),
  resetCode: z.string().length(6, "O código de redefinição deve ter 6 dígitos."),
  newPassword: z
    .string()
    .regex(password, {
      message:
        "A nova senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e pode conter caracteres especiais.",
    })
    .min(8, "A nova senha precisa conter pelo menos 8 caracteres."),
});