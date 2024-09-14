import { models } from "../models";

export async function calculateAverageRating(userId: string) {
  const reviews = await models.review.findMany({
    where: { reviewee_id: userId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return null;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await models.user.update({
    where: { id: userId },
    data: { average_rating: averageRating },
  });

  return averageRating;
}