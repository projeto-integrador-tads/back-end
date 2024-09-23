import { PrismaClient } from "@prisma/client";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

type PrismaModel = keyof Omit<PrismaClient, `$${string}`>;

export async function paginate<T, K extends PrismaModel>(
  model: PrismaClient[K],
  args: any,
  page: number = 1,
  perPage: number = 10,
  sanitizeCallback?: (item: any) => T
): Promise<PaginatedResult<T>> {
  const skip = (Number(page) - 1) * Number(perPage);

  const [total, data] = await Promise.all([
    (model as any).count(args.where ? { where: args.where } : {}),
    (model as any).findMany({
      ...args,
      take: perPage,
      skip: skip,
    }),
  ]);

  const lastPage = Math.ceil(total / perPage);

  const sanitizedData = sanitizeCallback ? data.map(sanitizeCallback) : data;

  return {
    data: sanitizedData,
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage,
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
    },
  };
}
