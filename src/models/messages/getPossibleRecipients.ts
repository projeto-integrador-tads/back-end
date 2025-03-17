import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { RideStatus, ReservationStatus } from "../../utils/constants";

interface Recipient {
  user_id: string;
  name: string;
  last_name: string;
  is_driver: boolean;
  ride_id: string;
  ride_status: string;
}

export async function getPossibleRecipients(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.userData?.id;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    // Get rides where user is a driver
    const ridesAsDriver = await models.ride.findMany({
      where: {
        driver_id: userId,
        status: {
          not: RideStatus.COMPLETED
        }
      },
      include: {
        Reservations: {
          where: {
            status: {
              in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING]
            }
          },
          include: {
            Passenger: {
              select: {
                id: true,
                name: true,
                last_name: true,
                is_driver: true
              }
            }
          }
        }
      }
    });

    // Get rides where user is a passenger
    const ridesAsPassenger = await models.ride.findMany({
      where: {
        Reservations: {
          some: {
            passenger_id: userId,
            status: {
              in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING]
            }
          }
        },
        status: {
          not: RideStatus.COMPLETED
        }
      },
      include: {
        Driver: {
          select: {
            id: true,
            name: true,
            last_name: true,
            is_driver: true
          }
        }
      }
    });

    // Format recipients from rides where user is driver
    const recipientsFromDriverRides: Recipient[] = ridesAsDriver.flatMap(ride => 
      ride.Reservations.map(reservation => ({
        user_id: reservation.Passenger.id,
        name: reservation.Passenger.name,
        last_name: reservation.Passenger.last_name,
        is_driver: reservation.Passenger.is_driver,
        ride_id: ride.ride_id,
        ride_status: ride.status
      }))
    );

    // Format recipients from rides where user is passenger
    const recipientsFromPassengerRides: Recipient[] = ridesAsPassenger.map(ride => ({
      user_id: ride.Driver.id,
      name: ride.Driver.name,
      last_name: ride.Driver.last_name,
      is_driver: ride.Driver.is_driver,
      ride_id: ride.ride_id,
      ride_status: ride.status
    }));

    // Combine and remove duplicates
    const allRecipients = [...recipientsFromDriverRides, ...recipientsFromPassengerRides];
    const uniqueRecipients = allRecipients.filter((recipient, index, self) =>
      index === self.findIndex(r => r.user_id === recipient.user_id && r.ride_id === recipient.ride_id)
    );

    return reply.send({
      recipients: uniqueRecipients
    });

  } catch (error) {
    console.error('Error fetching possible recipients:', error);
    return reply.status(500).send({ error: "Erro ao buscar destinatários possíveis." });
  }
} 