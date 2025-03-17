import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { paginate } from "../../utils/paginate";

interface ConversationSummary {
  ride_id: string | null;
  driver_id: string;
  driver_name: string;
  driver_last_name: string;
  passenger_id: string;
  passenger_name: string;
  passenger_last_name: string;
  last_message: {
    content: string;
    createdAt: Date;
  };
  ride_details?: {
    start_address: string;
    end_address: string;
    start_time: Date;
    status: string;
    price: number;
  };
}

export async function getUserConversations(
  request: FastifyRequest<{
    Querystring: {
      page?: number;
      perPage?: number;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const userId = request.userData?.id;
    const { page = 1, perPage = 10 } = request.query;

    if (!userId) {
      return reply.status(401).send({ error: "Usuário não autenticado." });
    }

    // Get the latest message for each unique conversation
    const conversations = await models.message.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        message_id: true,
        content: true,
        createdAt: true,
        ride_id: true,
        Sender: {
          select: {
            id: true,
            name: true,
            last_name: true,
            is_driver: true,
          }
        },
        Receiver: {
          select: {
            id: true,
            name: true,
            last_name: true,
            is_driver: true,
          }
        },
        Ride: {
          select: {
            ride_id: true,
            price: true,
            status: true,
            start_time: true,
            StartAddress: {
              select: {
                formattedAddress: true,
              }
            },
            EndAddress: {
              select: {
                formattedAddress: true,
              }
            },
            Driver: {
              select: {
                id: true,
                name: true,
                last_name: true,
              }
            }
          }
        }
      },
      distinct: ['ride_id'],
      take: perPage,
      skip: (page - 1) * perPage,
    });

    // Transform the data into a more structured format
    const formattedConversations: ConversationSummary[] = conversations.map(conv => {
      const isUserSender = conv.Sender.id === userId;
      const otherPerson = isUserSender ? conv.Receiver : conv.Sender;
      const isRideRelated = conv.ride_id !== null;

      return {
        ride_id: conv.ride_id,
        driver_id: isRideRelated ? conv.Ride!.Driver.id : (otherPerson.is_driver ? otherPerson.id : conv.Sender.id),
        driver_name: isRideRelated ? conv.Ride!.Driver.name : (otherPerson.is_driver ? otherPerson.name : conv.Sender.name),
        driver_last_name: isRideRelated ? conv.Ride!.Driver.last_name : (otherPerson.is_driver ? otherPerson.last_name : conv.Sender.last_name),
        passenger_id: isRideRelated ? (userId === conv.Ride!.Driver.id ? otherPerson.id : userId) : (otherPerson.is_driver ? userId : otherPerson.id),
        passenger_name: isRideRelated ? (userId === conv.Ride!.Driver.id ? otherPerson.name : conv.Sender.name) : (otherPerson.is_driver ? conv.Sender.name : otherPerson.name),
        passenger_last_name: isRideRelated ? (userId === conv.Ride!.Driver.id ? otherPerson.last_name : conv.Sender.last_name) : (otherPerson.is_driver ? conv.Sender.last_name : otherPerson.last_name),
        last_message: {
          content: conv.content,
          createdAt: conv.createdAt,
        },
        ...(conv.Ride && {
          ride_details: {
            start_address: conv.Ride.StartAddress.formattedAddress,
            end_address: conv.Ride.EndAddress.formattedAddress,
            start_time: conv.Ride.start_time,
            status: conv.Ride.status,
            price: Number(conv.Ride.price),
          }
        })
      };
    });

    // Get total count for pagination
    const uniqueConversations = await models.message.groupBy({
      by: ['ride_id'],
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
    });

    const totalCount = uniqueConversations.length;

    return reply.send({
      data: formattedConversations,
      pagination: {
        total: totalCount,
        page,
        perPage,
        totalPages: Math.ceil(totalCount / perPage),
      }
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return reply.status(500).send({ error: "Erro ao buscar conversas." });
  }
} 