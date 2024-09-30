import { FastifyInstance } from "fastify";
import { calculateAverageRating } from "../models/reviews/avarageCalculation";
import { eventTypes } from "../utils/constants";

export const reviewEvents = (app: FastifyInstance) => {
  app.eventBus.on(
    eventTypes.reviewCreated,
    async (data: { reviewee_id: string }) => {
      await calculateAverageRating(data.reviewee_id);
    }
  );

  app.eventBus.on(
    eventTypes.reviewUpdated,
    async (data: { reviewee_id: string }) => {
      await calculateAverageRating(data.reviewee_id);
    }
  );

  app.eventBus.on(
    eventTypes.reviewDeleted,
    async (data: { reviewee_id: string }) => {
      await calculateAverageRating(data.reviewee_id);
    }
  );
};
