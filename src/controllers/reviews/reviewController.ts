import { FastifyPluginAsync } from "fastify";
import { createReview } from "../../models/reviews/createReview";
import { updateReview } from "../../models/reviews/updateReview";
import { deleteReview } from "../../models/reviews/deleteReview";
import {
  createReviewSchema,
  reviewIdSchema,
  updateReviewSchema,
} from "../../models/reviews/validations/schemas";

export const reviewsController: FastifyPluginAsync = async (app) => {
  app.post(
    "/reviews",
    {
      schema: {
        body: createReviewSchema,
      },
    },
    createReview
  );

  app.put(
    "/reviews/:review_id",
    {
      schema: {
        body: updateReviewSchema,
      },
    },
    updateReview
  );

  app.delete(
    "/reviews/:review_id",
    { schema: { params: reviewIdSchema } },
    deleteReview
  );
};
