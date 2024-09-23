import sharp from 'sharp';

export async function resizeImage(inputBuffer: Buffer, resolution: number): Promise<Buffer> {
  try {
    const resizedImageBuffer = await sharp(inputBuffer)
      .resize(resolution, resolution, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    return resizedImageBuffer;
  } catch (error) {
    console.error('Erro ao alterar a resolução da imagem:', error);
    throw new Error('Erro ao alterar a resolução da imagem:');
  }
}