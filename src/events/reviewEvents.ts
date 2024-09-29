import { FastifyInstance } from "fastify";
import { calculateAverageRating } from "../models/reviews/avarageCalculation";

export const reviewEvents = (app: FastifyInstance) => {
  app.eventBus.on("reviewCreated", async (data: { reviewee_id: string }) => {
    await calculateAverageRating(data.reviewee_id);
  });

  app.eventBus.on("reviewUpdated", async (data: { reviewee_id: string }) => {
    await calculateAverageRating(data.reviewee_id);
  });

  app.eventBus.on("reviewDeleted", async (data: { reviewee_id: string }) => {
    await calculateAverageRating(data.reviewee_id);
  });
};
