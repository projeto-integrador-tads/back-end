import { FastifyRequest, FastifyReply } from "fastify";
import { models } from "../models";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../services/aws/s3";
import env from "../../../env";

export async function removeProfilePicture(
  req: FastifyRequest,
  res: FastifyReply
) {
  const id = req.userData?.id;

  try {
    const user = await models.user.findUnique({
      where: { id: id },
      select: { profile_picture: true },
    });

    if (!user || !user.profile_picture) {
      return res.status(404).send({ error: "Foto de perfil não encontrada." });
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: user.profile_picture,
    });
    await s3.send(deleteCommand);

    await models.user.update({
      where: { id: id },
      data: { profile_picture: null },
    });

    return res
      .status(200)
      .send({ message: "Foto de perfil removida com sucesso!" });
  } catch (error) {
    return res.status(500).send({
      error:
        "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",
    });
  }
}
