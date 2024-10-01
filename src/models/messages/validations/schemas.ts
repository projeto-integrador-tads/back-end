import { z } from "zod";

export const sendMessageSchema = z.object({
  ride_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  content: z.string().min(1).max(500),
});

export const messageListingParamans = z.object({
  ride_id: z.string().uuid("Forneça um UUID válido."),
});
