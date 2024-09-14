import { FastifyInstance } from "fastify";
import { calculateAverageRating } from "../models/reviews/avarageCalculation";

export const reviewEvents = (fastify: FastifyInstance) => {
  // ... existing event listeners ...

  fastify.eventBus.on("reviewCreated", async (data: { reviewee_id: string }) => {
    await calculateAverageRating(data.reviewee_id);
  });

  fastify.eventBus.on("reviewUpdated", async (data: { reviewee_id: string }) => {
    await calculateAverageRating(data.reviewee_id);
  });

  fastify.eventBus.on("reviewDeleted", async (data: { reviewee_id: string }) => {
    await calculateAverageRating(data.reviewee_id);
  });
};