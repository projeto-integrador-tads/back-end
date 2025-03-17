import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../../../env";
import { s3 } from "../../services/aws/s3";

interface GetProfilePictureByIdParams {
  id: string;
}

export async function getProfilePictureById(
  request: FastifyRequest<{ Params: GetProfilePictureByIdParams }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  try {
    const user = await models.user.findUnique({
      where: { id: id },
      select: { profile_picture: true },
    });

    if (!user || !user.profile_picture) {
      return reply
        .status(404)
        .send({ error: "Imagem de perfil não encontrada." });
    }

    const command = new GetObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: user.profile_picture,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });

    return reply.send({ url: signedUrl });
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno no servidor." });
  }
} 