import { FastifyReply } from "fastify";
import { ImageResizeError } from "../exeptions/imageResizeError";

export function handleImageResizeError(error: unknown, reply: FastifyReply) {
  if (error instanceof ImageResizeError) {
    return reply.status(400).send({
      error: "Erro ao redimensionar a imagem",
      message: error.message,
    });
  }
}
