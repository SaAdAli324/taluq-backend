import { messageServices } from "../services/message.services.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler.js";
import redisClient from "../config/redis.js";
import logger from "../utils/logger.js";
export const messagesController = {
    sendMessage: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user?._id?.toString()
        const receiver = req.params._id
        const text = req.body.message
        const type = req.params.type
        const io = (req as any).app.get("io")
        if (!text || !receiver || !user) {
            return next(new AppError("all fields are required", 400))
        }
     
  
        const newMessage = await messageServices.sendMessageService(user as string, type as string, receiver as string, text as string)


        io.to(receiver).emit("receive_message", {
            message: newMessage,
        })

        res.status(201).json({
            message: "message send successfully",
            success: true,
            data: newMessage
        })
    }),
    getMessages: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const conversationId = req.params.conversationId


        if (!conversationId) {
            return next(new AppError("Conversation id is required", 400))
        }
        const  page = parseInt(req.query.page as string ) || 1
        const limit =50
        const skip = (page-1)*limit
        const messages = await messageServices.getMessageService(conversationId as string ,page ,skip, limit)
        let hasMore = false
        if(messages.length===50){
            hasMore=true
        }
        res.status(200).json({
            message: "messages fetched successfully",
            success: true,
            data: messages,
            hasMore:hasMore
        })
    }),
    deleteMessage: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { messageId, userId } = req.params
        const io = (req as any).app.get("io")
        const user = (req as any).user?._id?.toString()

        if (!messageId || !user || !userId) {
            return next(new AppError("message id is required", 404))

        }
        const newMessage = await messageServices.deleteMessageService(messageId as string)

        io.to(userId).emit("delete_message", {
            message: newMessage
        })
        res.status(201).json({
            message: "message send successfully",
            success: true,
            data: newMessage
        })

    }),
    updateMessage: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { text } = req.body
        const io = (req as any).app.get("io")
        const messageId = req.params.messageId
        const userId = req.params.userId

        if (!text || !messageId) {
            return next(new AppError("message id and text is required", 404))

        }
        const message = await messageServices.patchMessageService(messageId as string, text as string)

        io.to(userId).emit("update_message", {
            message: message
        })
        res.status(201).json({
            message: "message updated successfully",
            success: true,
            data: message
        })

    }),
    sendFile: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user?._id?.toString()
        const receiver = req.params._id
        const conversationId = req.params.conversationId
        const io = (req as any).app.get("io")

        if (!req.file) {
            return next(new AppError("no file uploaded", 400))
        }

        if (!receiver || !user || !conversationId) {
            return next(new AppError("receiver and conversation ID are required", 400))
        }

        const fileUrl = req.file.path
        const originalName = req.file.originalname
        const mimeType = req.file.mimetype

        let type = "file"
        if (mimeType.startsWith("image/")) {
            type = "image"
        } else if (mimeType.startsWith("video/")) {
            type = "video"
        }

        const messageText = type === "file"
            ? JSON.stringify({ url: fileUrl, name: originalName })
            : fileUrl

        const newMessage = await messageServices.sendMessageService(
            user as string,
            type as string,
            receiver as string,
            messageText as string
        )

        io.to(receiver).emit("receive_message", {
            message: newMessage,
        })

        res.status(201).json({
            message: "file sent successfully",
            success: true,
            data: newMessage
        })
    })

}
