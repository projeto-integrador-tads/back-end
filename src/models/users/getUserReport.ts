import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  averageRating: number | null;
}

interface RideStats {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  inProgressRides: number;
  scheduledRides: number;
  averagePrice: number;
}

interface ReservationStats {
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  pendingReservations: number;
  averageReservationsPerRide: number;
}

interface CorporateReport {
  period: {
    start: string;
    end: string;
  };
  userStats: UserStats;
  rideStats: RideStats;
  reservationStats: ReservationStats;
  topCities: {
    startCities: { city: string; count: number }[];
    endCities: { city: string; count: number }[];
  };
  topDrivers: {
    id: string;
    name: string;
    last_name: string;
    completedRides: number;
    averageRating: number;
  }[];
}

export async function generateUserReport(
  request: FastifyRequest<{
    Querystring: {
      startDate?: string;
      endDate?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { startDate, endDate } = request.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const userStats = await models.user.aggregate({
      _count: {
        id: true,
      },
      _avg: {
        average_rating: true,
      },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const activeDrivers = await models.user.count({
      where: {
        is_driver: true,
        active: true,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const rideStats = await models.ride.groupBy({
      by: ['status'],
      _count: {
        ride_id: true,
      },
      _avg: {
        price: true,
      },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const reservationStats = await models.reservation.groupBy({
      by: ['status'],
      _count: {
        reservation_id: true,
      },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const topStartCities = await models.address.groupBy({
      by: ['city'],
      _count: {
        id: true,
      },
      where: {
        ridesAsStart: {
          some: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const topDrivers = await models.user.findMany({
      where: {
        is_driver: true,
        RidesDriven: {
          some: {
            status: 'COMPLETED',
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        last_name: true,
        average_rating: true,
        _count: {
          select: {
            RidesDriven: {
              where: {
                status: 'COMPLETED',
                createdAt: {
                  gte: start,
                  lte: end,
                },
              },
            },
          },
        },
      },
      orderBy: {
        RidesDriven: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    const report: CorporateReport = {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      userStats: {
        totalUsers: userStats._count.id,
        activeUsers: await models.user.count({ where: { active: true } }),
        totalDrivers: await models.user.count({ where: { is_driver: true } }),
        activeDrivers,
        averageRating: userStats._avg.average_rating,
      },
      rideStats: {
        totalRides: rideStats.reduce((acc, curr) => acc + curr._count.ride_id, 0),
        completedRides: rideStats.find(s => s.status === 'COMPLETED')?._count.ride_id ?? 0,
        cancelledRides: rideStats.find(s => s.status === 'CANCELLED')?._count.ride_id ?? 0,
        inProgressRides: rideStats.find(s => s.status === 'IN_PROGRESS')?._count.ride_id ?? 0,
        scheduledRides: rideStats.find(s => s.status === 'SCHEDULED')?._count.ride_id ?? 0,
        averagePrice: rideStats[0]?._avg.price?.toNumber() ?? 0,
      },
      reservationStats: {
        totalReservations: reservationStats.reduce((acc, curr) => acc + curr._count.reservation_id, 0),
        confirmedReservations: reservationStats.find(s => s.status === 'CONFIRMED')?._count.reservation_id ?? 0,
        cancelledReservations: reservationStats.find(s => s.status === 'CANCELLED')?._count.reservation_id ?? 0,
        pendingReservations: reservationStats.find(s => s.status === 'PENDING')?._count.reservation_id ?? 0,
        averageReservationsPerRide: (reservationStats.reduce((acc, curr) => acc + curr._count.reservation_id, 0)) / (rideStats.reduce((acc, curr) => acc + curr._count.ride_id, 0) || 1),
      },
      topCities: {
        startCities: topStartCities.map(city => ({
          city: city.city,
          count: city._count.id,
        })),
        endCities: [], 
      },
      topDrivers: topDrivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        last_name: driver.last_name,
        completedRides: driver._count.RidesDriven,
        averageRating: driver.average_rating ?? 0,
      })),
    };

    return reply.send(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return reply.status(500).send({ error: "Erro ao gerar relatório." });
  }
} 