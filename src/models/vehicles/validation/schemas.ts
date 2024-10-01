import { z } from "zod";
import { plate } from "../../../utils/regex";

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
});

export const deleteVehicleSchema = z.object({
  vehicle_id: z.string().uuid("ID do veículo deve ser um UUID válido"),
});

export const reactivateVehicleSchema = z.object({
  vehicle_id: z.string(),
});

export const updateVehicleSchema = z.object({
  vehicle_id: z.string().uuid(),
  color: z.string().min(2).max(30).optional(),
  seats: z.number().int().min(1).max(50).optional(),
});
