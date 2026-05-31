import mongoose from "mongoose";
import { Messages } from "../models/messages.model.js";
import { AppError } from "../utils/errorHandler.js";
import logger from "../utils/logger.js";
import { Conversation } from "../models/conversation.model.js";
import redisClient from "../config/redis.js";
export const messageServices = {

    async sendMessageService(user: string, type:string,receiver: string, text: string) {
        
        let conversation = await Conversation.findOne({
            participants: { $all: [user, receiver] }
        })
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [user, receiver]
            })
        }
        logger.info(`Checking Redis for receiver ${receiver} status with key: user_status:${receiver} and type: ${type}`)
        const rec = await redisClient.get(`user_status:${receiver}`)
        let newMessage;
        if (rec !== null) {
            newMessage = await Messages.create({
                conversationId: conversation._id,
                sender: user,
                text: text,
                type: type,
                receiver: receiver,
                issend: true,
                isdelivered: true
            });
        } else {
            newMessage = await Messages.create({
                conversationId: conversation._id,
                sender: user,
                receiver: receiver,
                type: type,
                text: text,
                issend: true
            });
        }

        conversation.lastMessage = newMessage._id as any;
        await conversation.save()
        return newMessage
    },

    async getMessageService(conversationId: string ,page: number, skip: number, limit: number) {
        const messages = await Messages.find({ conversationId: conversationId }).sort({createdAt:-1}).skip(skip).limit(limit)
        const sortMessages = messages.reverse()
        
        return sortMessages
    },
    async deleteMessageService(messageId: string,) {
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            throw new AppError("Invalid message ID format", 400);
        }
        const newMessage = await Messages.findOneAndUpdate({ _id: messageId }, { text: "this message has been deleted", deleted: true }, { new: true })

        if (!newMessage) {
            throw new AppError("message not found", 404)
        }


        console.log("this is the new messags", newMessage);

        return newMessage
    },
    async patchMessageService(messageId: string, text: string) {
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            throw new AppError("Invalid message ID format", 400);
        }
        const currentMessage = await Messages.findById(messageId)
        if (currentMessage?.text === text.trim()) return currentMessage
        const message = await Messages.findOneAndUpdate({ _id: messageId }, { text: text, isEdited: true }, { new: true })
        if (!message) {
            throw new AppError("message not found", 404)
        }
        return message
    }
}