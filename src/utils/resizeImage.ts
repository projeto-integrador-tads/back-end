import sharp from "sharp";
import { ImageResizeError } from "../exeptions/imageResizeError";

export async function resizeImage(
  inputBuffer: Buffer,
  resolution: number
): Promise<Buffer> {
  try {
    const resizedImageBuffer = await sharp(inputBuffer)
      .resize(resolution, resolution, {
        fit: "cover",
        position: "center",
      })
      .toBuffer();

    return resizedImageBuffer;
  } catch (error) {
    throw new ImageResizeError("Erro ao alterar a resolução da imagem.");
  }
}
