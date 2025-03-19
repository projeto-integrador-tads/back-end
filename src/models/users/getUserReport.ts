import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";

interface PersonalUserReport {
  personalData: {
    id: string;
    name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    profile_picture: string | null;
    createdAt: Date;
    is_driver: boolean;
    average_rating: number | null;
  };
  savedAddresses: {
    id: string;
    formattedAddress: string;
    city: string;
    createdAt: Date;
  }[];
  ridesAsDriver: {
    ride_id: string;
    start_time: Date;
    end_time: Date | null;
    price: number;
    status: string;
    startAddress: string;
    endAddress: string;
    createdAt: Date;
  }[];
  ridesAsPassenger: {
    ride_id: string;
    start_time: Date;
    end_time: Date | null;
    price: number;
    status: string;
    startAddress: string;
    endAddress: string;
    reservation_status: string;
    payment_status: string;
    createdAt: Date;
  }[];
  vehicles: {
    vehicle_id: string;
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    color: string;
    seats: number;
    active: boolean;
    createdAt: Date;
  }[];
  reviewsGiven: {
    review_id: string;
    ride_id: string;
    reviewee_id: string;
    reviewee_name: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }[];
  reviewsReceived: {
    review_id: string;
    ride_id: string;
    reviewer_id: string;
    reviewer_name: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }[];
  messages: {
    message_id: string;
    content: string;
    sender_id: string;
    sender_name: string;
    receiver_id: string;
    receiver_name: string;
    ride_id: string | null;
    createdAt: Date;
  }[];
}

export async function generateUserReport(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.userData?.id;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    const user = await models.user.findUnique({
      where: { id: userId },
      include: {
        savedAddresses: {
          where: { deleted: false },
          select: {
            id: true,
            formattedAddress: true,
            city: true,
            createdAt: true,
          },
        },
        RidesDriven: {
          include: {
            StartAddress: true,
            EndAddress: true,
          },
        },
        ReservationsMade: {
          include: {
            Ride: {
              include: {
                StartAddress: true,
                EndAddress: true,
              },
            },
          },
        },
        VehiclesOwned: true,
        ReviewsWritten: {
          include: {
            Reviewee: {
              select: {
                name: true,
                last_name: true,
              },
            },
          },
        },
        ReviewsReceived: {
          include: {
            Reviewer: {
              select: {
                name: true,
                last_name: true,
              },
            },
          },
        },
        MessagesSent: {
          include: {
            Receiver: {
              select: {
                name: true,
                last_name: true,
              },
            },
          },
        },
        MessagesReceived: {
          include: {
            Sender: {
              select: {
                name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado." });
    }

    const report: PersonalUserReport = {
      personalData: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        profile_picture: user.profile_picture,
        createdAt: user.createdAt,
        is_driver: user.is_driver,
        average_rating: user.average_rating,
      },
      savedAddresses: user.savedAddresses,
      ridesAsDriver: user.RidesDriven.map(ride => ({
        ride_id: ride.ride_id,
        start_time: ride.start_time,
        end_time: ride.end_time,
        price: Number(ride.price),
        status: ride.status,
        startAddress: ride.StartAddress.formattedAddress,
        endAddress: ride.EndAddress.formattedAddress,
        createdAt: ride.createdAt,
      })),
      ridesAsPassenger: user.ReservationsMade.map(reservation => ({
        ride_id: reservation.Ride.ride_id,
        start_time: reservation.Ride.start_time,
        end_time: reservation.Ride.end_time,
        price: Number(reservation.Ride.price),
        status: reservation.Ride.status,
        startAddress: reservation.Ride.StartAddress.formattedAddress,
        endAddress: reservation.Ride.EndAddress.formattedAddress,
        reservation_status: reservation.status,
        payment_status: reservation.payment_status,
        createdAt: reservation.createdAt,
      })),
      vehicles: user.VehiclesOwned.map(vehicle => ({
        vehicle_id: vehicle.vehicle_id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        license_plate: vehicle.license_plate,
        color: vehicle.color,
        seats: vehicle.seats,
        active: vehicle.active,
        createdAt: vehicle.createdAt,
      })),
      reviewsGiven: user.ReviewsWritten.map(review => ({
        review_id: review.review_id,
        ride_id: review.ride_id,
        reviewee_id: review.reviewee_id,
        reviewee_name: `${review.Reviewee.name} ${review.Reviewee.last_name}`,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      reviewsReceived: user.ReviewsReceived.map(review => ({
        review_id: review.review_id,
        ride_id: review.ride_id,
        reviewer_id: review.reviewer_id,
        reviewer_name: `${review.Reviewer.name} ${review.Reviewer.last_name}`,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      messages: [
        ...user.MessagesSent.map(msg => ({
          message_id: msg.message_id,
          content: msg.content,
          sender_id: msg.sender_id,
          sender_name: `${user.name} ${user.last_name}`,
          receiver_id: msg.receiver_id,
          receiver_name: `${msg.Receiver.name} ${msg.Receiver.last_name}`,
          ride_id: msg.ride_id,
          createdAt: msg.createdAt,
        })),
        ...user.MessagesReceived.map(msg => ({
          message_id: msg.message_id,
          content: msg.content,
          sender_id: msg.sender_id,
          sender_name: `${msg.Sender.name} ${msg.Sender.last_name}`,
          receiver_id: msg.receiver_id,
          receiver_name: `${user.name} ${user.last_name}`,
          ride_id: msg.ride_id,
          createdAt: msg.createdAt,
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    };

    return reply.send(report);
  } catch (error) {
    console.error('Error generating personal user report:', error);
    return reply.status(500).send({ error: "Erro ao gerar relatório pessoal." });
  }
} 