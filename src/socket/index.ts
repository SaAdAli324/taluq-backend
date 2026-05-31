import type { Server } from "socket.io";

import { authSocket } from "./middleWares/authSocket.js";
import logger from "../utils/logger.js";

import redisClient from "../config/redis.js";
import { Conversation } from "../models/conversation.model.js";
import { Messages } from "../models/messages.model.js";
import mongoose from "mongoose";


const checkUserStatuses = async (conversation: any[], userId: string) => {
  const allParticipantsId = [
    ...new Set(conversation.flatMap((conversation) => conversation?.participants?.filter((p: any) => p.toString() !== userId.toString())))
  ]
  if (allParticipantsId.length === 0) {
    return [];
  }
  const redisKeys = allParticipantsId.map((id) => `user_status:${id}`)
  const statuses = await redisClient.mGet(redisKeys)
  const filteredStatus = statuses.filter((status) => status !== null)
  return filteredStatus
}

const updatePendingMessages = async (userId: string, io: Server) => {

  try {
    const mongoId = new mongoose.Types.ObjectId(userId)
    const message = await Messages.find({ receiver: mongoId, isdelivered: false }).lean()
    if (message.length === 0) {
      logger.info("no messages to deliver")
      return
    }

    await Messages.updateMany({ receiver: mongoId, isdelivered: false }, { $set: { isdelivered: true } })
    console.log("mark as delivered")
    message.forEach((msg) => {
      msg.isdelivered = true
    })

    const uniqueSenders = [...new Set(message.map((msg) => msg.sender!.toString()))]
    uniqueSenders.forEach((send) => {
      io.to(send).emit("delivered_message", {
        message: message.filter((m: any) => m.sender!.toString() === send)
      })
      console.log(`Backend Emit Fired to room: ${send}`);
    })

  }
  catch (error) {
    logger.error("error updating pending messages", error)
  }
}


const updateMessagesToSeen = async (conversationId: string, currentUserId: string, io: Server) => {

  try {
    const convId = new mongoose.Types.ObjectId(conversationId)
    const recId = new mongoose.Types.ObjectId(currentUserId)
    const message = await Messages.find({ conversationId: convId, receiver: recId, seen: false }).lean()

    if (message.length === 0) {
      logger.info("no messages to mark as seen")
      return
    }

    await Messages.updateMany({ conversationId: convId, receiver: recId, seen: false }, { $set: { seen: true } })
    console.log("mark as seen")
    message.forEach((msg) => {
      msg.seen = true
    })

    const uniqueSenders = [...new Set(message.map((msg) => msg.sender!.toString()))]
    uniqueSenders.forEach((send) => {
      io.to(send).emit("message_seen", {
        message: message.filter((m: any) => m.sender!.toString() === send)
      })
      console.log(`Backend Emit Fired to room: ${send}`);
    })

  }
  catch (error) {
    logger.error("error updating messages to seen", error)
  }
}

const instantMessageSeen = async (messageId: string, io: Server) => {
  try {
    const message = await Messages.findByIdAndUpdate(messageId, { $set: { seen: true } }, { new: true }).lean()
    if (!message) {
      logger.info("no message found")
      return
    }
    logger.info("message seen", message)
    io.to(message.sender!.toString()).emit("instant_message_seen", {
      message: message
    })
  }
  catch (error) {
    logger.error("error updating pending messages", error)
  }
}

export const initializeSocket = (io: Server) => {

  io.use(authSocket)
  io.on("connection", async (socket) => {
    logger.info("user connected", socket.data.user.name)

    const user = socket.data.user
    const userId = user._id.toString()
    const conversation = await Conversation.find({ participants: userId }).select("-lastMessage")
    if (!conversation) {
      return 
    }

    socket.join(userId)
    await redisClient.setEx(`user_status:${userId}`, 86400, userId)

    socket.on("disconnect", async () => {
      logger.info("user disconnected", user.name)
      await redisClient.del(`user_status:${userId}`)
      const filteredStatus = await checkUserStatuses(conversation, userId)
      filteredStatus?.forEach((allContacts) => {
        io.to(allContacts).emit('user_offline', userId)
      })

    })
    const filteredStatus = await checkUserStatuses(conversation, userId)
    filteredStatus.forEach((allContacts) => {
      if (allContacts) {
        io.to(allContacts).emit('user_online', [userId])
      }
    })

    socket.on("typing", (data) => {
      logger.info("typing", data.userId)
      io.to(data.userId.toString()).emit("user_typing", { typing: true, conversationId: data.conversationId })

    })

    socket.on('request_online_users', async () => {
      const filteredStatus = await checkUserStatuses(conversation, userId)
      io.to(userId).emit("user_online", filteredStatus)
    })
    updatePendingMessages(userId, io)
    socket.on("mark_seen", async (messageId) => {
      instantMessageSeen(messageId, io)
    })
    socket.on("trigger_message_seen", async (id) => {
      updateMessagesToSeen(id, userId, io)
    })

  })
}