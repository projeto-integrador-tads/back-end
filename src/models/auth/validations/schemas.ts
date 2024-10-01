import { z } from "zod";
import { password } from "../../../utils/regex";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z
    .string()
    .min(8, { message: "A senha precisa conter pelo menos 8 caracteres." }),
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

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email em formato inválido."),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, "A senha atual precisa conter pelo menos 8 caracteres."),
  newPassword: z
    .string()
    .regex(password, {
      message:
        "A nova senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e pode conter caracteres especiais.",
    })
    .min(8, "A nova senha precisa conter pelo menos 8 caracteres."),
});
