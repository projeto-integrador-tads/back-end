import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  DATABASE_URL: z.string().url(),
  GOOGLE_MAPS_API_KEY: z.string(),
  MAIL_SERVICE_USER: z.string(),
  MAIL_SERVICE_PASS: z.string(),
  MAIL_SERVICE_HOST: z.string(),
  MAIL_SERVICE_PORT: z.coerce.number(),
  JWT_SECRET: z.string()
});

const env = envSchema.parse(process.env);

export default env;