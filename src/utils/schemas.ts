import { z } from "zod";
import { password } from "./regex";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(8, { message: "A senha precisa conter pelo menos 8 caracteres." }),
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
  resetCode: z
    .string()
    .length(6, "O código de redefinição deve ter 6 dígitos."),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email em formato inválido."),
  resetCode: z
    .string()
    .length(6, "O código de redefinição deve ter 6 dígitos."),
  newPassword: z
    .string()
    .regex(password, {
      message:
        "A nova senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e pode conter caracteres especiais.",
    })
    .min(8, "A nova senha precisa conter pelo menos 8 caracteres."),
});

export const sendMessageSchema = z.object({
  ride_id: z.string().uuid(),
  content: z.string().min(1).max(500),
});

export const paginationSchema = z.object({
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
});

export const messageListingParamans = z.object({
  ride_id: z.string().uuid("Forneça um UUID válido."),
});

export const createAddressSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const deleteAddressSchema = z.object({
  id: z.string().uuid(),
});

export const addressIdSchema = z.object({
  id: z.string().uuid(),
});
