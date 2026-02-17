import express from "express";
import multer from "multer";
export const router = express.Router();

import { getChat } from "../controllers/ChatController.js";
import { uploadImage } from "../controllers/UploadImageController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.route("/chat").get(authenticateToken, getChat);
router.route("/chat/upload-image").post(authenticateToken, upload.single("image"), uploadImage);
