import { FastifyReply } from "fastify";
import { ValidationError } from "./validationError";

export function handleValidationError(error: any, reply: FastifyReply) {
  if (error instanceof ValidationError)
    return reply.status(error.code).send({ error: error.message });
}
