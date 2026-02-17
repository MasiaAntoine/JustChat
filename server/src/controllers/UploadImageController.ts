import { Request, Response } from "express";
import sharp from "sharp";
import { tryCatch } from "../utils/tryCatch.js";
import { AppError } from "../utils/AppError.js";
import { IErrorCode } from "../types/IErrorCode.js";
import { IStatusCode } from "../types/IStatusCode.js";

const MAX_WIDTH = 800;
const JPEG_QUALITY = 80;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadImageController = async (req: Request, res: Response): Promise<void> => {
  if (!req.file?.buffer) throw new AppError(IErrorCode.UNEXCPECTED_ERROR, "Aucune image reçue", IStatusCode.BAD_REQUEST);
  if (req.file.size > MAX_FILE_SIZE) throw new AppError(IErrorCode.UNEXCPECTED_ERROR, "Image trop volumineuse (max 10 Mo)", IStatusCode.BAD_REQUEST);

  const buffer = req.file.buffer;
  const image = sharp(buffer);
  const meta = await image.metadata();
  const format = meta.format === "png" ? "png" : "jpeg";

  const compressed = await image
    .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
    [format](format === "png" ? { compressionLevel: 8 } : { quality: JPEG_QUALITY })
    .toBuffer();

  const base64 = compressed.toString("base64");
  const dataUrl = `data:image/${format};base64,${base64}`;

  res.status(IStatusCode.OK).json({ image: dataUrl });
};

export const uploadImage = tryCatch(uploadImageController);
