import { FastifyPluginAsync } from "fastify";
import { createReviewSchema, updateReviewSchema } from "../../utils/schemas";
import { createReview } from "../../models/reviews/createReview";
import { updateReview } from "../../models/reviews/updateReview";
import { deleteReview } from "../../models/reviews/deleteReview";

export const reviewsController: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/reviews",
    {
      schema: {
        body: createReviewSchema,
      },
    },
    createReview
  );

  fastify.put(
    "/reviews/:review_id",
    {
      schema: {
        body: updateReviewSchema,
      },
    },
    updateReview
  );

  fastify.delete(
    "/reviews/:review_id",
    deleteReview
  );
};
