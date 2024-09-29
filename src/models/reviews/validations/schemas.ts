import { z } from "zod";

export const createReviewSchema = z.object({
  ride_id: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export const reviewIdSchema = z.object({
  review_id: z.string().uuid(),
});
