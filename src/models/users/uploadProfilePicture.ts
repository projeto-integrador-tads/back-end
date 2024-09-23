import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { resizeImage } from "../../utils/resizeImage";
import { env } from "process";
import { models } from "../models";
import { FastifyReply, FastifyRequest } from "fastify";
import { s3 } from "../../services/aws/s3";

export async function uploadProfilePicture(
  req: FastifyRequest,
  res: FastifyReply
) {
  const id = req.userData?.id;

  try {
    const data = await req.file({ limits: { fileSize: 5242880 } });

    if (!data) {
      return res.status(400).send({ error: "Nenhum arquivo foi enviado." });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return res.status(400).send({
        error:
          "Tipo de arquivo não suportado. Por favor, envie uma imagem JPG ou PNG",
      });
    }

    const resizedImageBuffer = await resizeImage(await data.toBuffer(), 512);
    const fileName = crypto.randomUUID().concat(data.filename);

    const putObjectCommand = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: fileName,
      Body: resizedImageBuffer,
      ContentType: data.mimetype,
    });

    await s3.send(putObjectCommand);

    const user = await models.user.findUnique({
      where: { id: id },
      select: { profile_picture: true },
    });

    if (user?.profile_picture) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: user.profile_picture,
      });
      await s3.send(deleteCommand);
    }

    await models.user.update({
      data: { profile_picture: fileName },
      where: { id: id },
    });

    return res
      .status(200)
      .send({ message: "Foto de perfil atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    return res.status(500).send({
      error:
        "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",
    });
  }
}
