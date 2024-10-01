import { z } from "zod";

const testEnvSchema = z.object({
  NODE_ENV: z.enum(["test"]),
  DATABASE_URL: z.string().url(),
  GOOGLE_MAPS_API_KEY: z.string(),
  MAIL_SERVICE_USER: z.string(),
  MAIL_SERVICE_PASS: z.string(),
  MAIL_SERVICE_HOST: z.string(),
  MAIL_SERVICE_PORT: z.coerce.number(),
  JWT_SECRET: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  BUCKET_NAME: z.string(),
});

const testEnv = testEnvSchema.parse(process.env);

export default testEnv;
