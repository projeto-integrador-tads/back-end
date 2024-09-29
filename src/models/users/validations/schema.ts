import { z } from "zod";
import { password, phone } from "../../../utils/regex";

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

export const updateUserSchema = z.object({
  name: z.string().min(3, "Nome inválido.").optional(),
  last_name: z.string().min(3, "Sobrenome inválido.").optional(),
  phone_number: z
    .string()
    .regex(phone, { message: "Número inválido." })
    .optional(),
});

export const userIdSchema = z.object({
  id: z.string(),
});
