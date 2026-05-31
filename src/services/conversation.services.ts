import { AppError } from "../utils/errorHandler.js";
import { Conversation } from "../models/conversation.model.js";
import { log } from "node:console";
import { Messages } from "../models/messages.model.js";
import { json } from "node:stream/consumers";
export const conversationServices = {

    async addConversationService(ownerId: string, contactId: string, ) {
        let conversation = await Conversation.findOne({ participants: { $all: [ownerId, contactId] } })
       
        if (conversation) {
            const lastMessage= Messages.find({conversationId:conversation._id}).sort()
            const populatedConv = await Conversation.findById(conversation._id)
                .populate({
                    path: "participants",
                    match: { _id: { $ne: ownerId } },
                    select: "name profilePic isOnline biography"
                })
                .populate("lastMessage")
                .lean()
                .exec();
            return populatedConv;
        }
        const newConversation = await Conversation.create({
            participants: [ownerId, contactId],
         
        })
        const populatedConv = await Conversation.findById(newConversation._id)
            .populate({
                path: "participants",
                match: { _id: { $ne: ownerId } },
                select: "name profilePic isOnline biography"
            })
            .populate("lastMessage")
            .lean()
            .exec();
        return populatedConv;
    },

    async getConversationService(ownerId: string) {
        const conversations = await Conversation.find({ 
            participants: { $in: [ownerId] } 
        })
        .populate({
            path: "participants",
            match: { _id: { $ne: ownerId } },
            select: "name profilePic isOnline biography"
        })
        .populate("lastMessage")
        .lean()
        .exec();

        if (!conversations || conversations.length === 0) {
        
            throw new AppError("No Conversations found", 404);
        }

        return conversations;
    },

    async deleteConversationService(conversationId:string) {
        const conversation = await Conversation.findByIdAndDelete(conversationId)
        const messages = await Messages.deleteMany({conversationId:conversationId})
        if (!conversation) {
            throw new AppError("Contact not found", 404)
        }
        const success = true

        return success   
    }
    // async updateConversationervice(ownerId: string, contactId: string, savedName: string) {
    //     const conversation = await Conversation.findOne({ ownerId, contactId })
    //     if (!conversation) {
    //         throw new AppError("contact not found", 404)
    //     }
    //     conversation.savedName = savedName
    //     await conversation.save()
    //     return Conversation
    // },

}