import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { UpdateReviewInput, UpdateReviewParams } from "../../types";

export async function updateReview(
  request: FastifyRequest<{
    Params: UpdateReviewParams;
    Body: UpdateReviewInput;
  }>,
  reply: FastifyReply
) {
  const { review_id } = request.params;
  const { rating, comment } = request.body;
  const reviewer_id = request.userData?.id;

  if (!reviewer_id) {
    return reply.status(401).send({ error: "Usuário não autenticado." });
  }

  try {
    const existingReview = await models.review.findUnique({
      where: { review_id },
    });

    if (!existingReview) {
      return reply.status(404).send({ error: "Avaliação não encontrada." });
    }

    if (existingReview.reviewer_id !== reviewer_id) {
      return reply.status(403).send({
        error: "Você não tem permissão para atualizar esta avaliação.",
      });
    }

    const updatedReview = await models.review.update({
      where: { review_id },
      data: {
        rating,
        comment,
      },
    });

    request.server.eventBus.emit("reviewUpdated", {
      reviewee_id: existingReview.reviewee_id,
    });

    return reply.status(200).send(updatedReview);
  } catch (error) {
    console.error("Erro ao atualizar a avaliação:", error);
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
