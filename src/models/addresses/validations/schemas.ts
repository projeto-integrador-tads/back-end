import { z } from "zod";

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
