import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { eventTypes } from "../../utils/constants";
import { DeleteReviewParams } from "../../types";

export async function deleteReview(
  request: FastifyRequest<{ Params: DeleteReviewParams }>,
  reply: FastifyReply
) {
  const { review_id } = request.params;
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
      return reply
        .status(403)
        .send({ error: "Você não tem permissão para deletar esta avaliação." });
    }

    await models.review.delete({
      where: { review_id },
    });

    request.server.eventBus.emit(eventTypes.reviewDeleted, {
      reviewee_id: existingReview.reviewee_id,
    });

    return reply.status(204).send();
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
}
