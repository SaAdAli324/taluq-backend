import { messagesController } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import uploadChatAttachment from "../config/multerChat.js";

import express from "express";

const router = express.Router()
router.post("/send/:type/:_id/:conversationId", protect, messagesController.sendMessage)
router.post("/send-file/:_id/:conversationId", protect, uploadChatAttachment.single("file"), messagesController.sendFile)
router.get("/:conversationId", protect, messagesController.getMessages)
router.patch("/delete/:messageId/:userId", protect, messagesController.deleteMessage)
router.patch("/update/:messageId/:userId", protect, messagesController.updateMessage)

export default router