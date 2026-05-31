import { catchAsync } from "../utils/catchAsync.js";
import { conversationServices } from "../services/conversation.services.js";
import type { Response, Request, NextFunction } from "express";
import { AppError } from "../utils/errorHandler.js";

export const conversationController = {

    addConversation: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { contactId } = req.body
        const ownerId = (req as any).user?._id?.toString()
        console.log(ownerId , "this is owner id " ,  "this is contact id" , contactId);
        
        if (!ownerId || !contactId) {
            console.log("Validation failed: ownerId or contactId missing", { ownerId, contactId });
            return next(new AppError("All fields are required", 400))
        }
        const conversation = await conversationServices.addConversationService(ownerId, contactId )
        res.status(201).json({ success: true, data: conversation })
    }),

    getConversation: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const  ownerId  = ( req as any).user?._id?.toString()
        if (!ownerId) {
            return next(new AppError("something went wrong", 500))
        }
        const conversation = await conversationServices.getConversationService(ownerId)
        if (!conversation) {
        res.status(200).json({ success: false,})
            
        }
        console.log(conversation , "this is conversation");
        
        res.status(200).json({ success: true, data: conversation })

    }),

    deleteConversation: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const  conversationId  = req.params.conversationId
        const ownerId = (req as any).user?._id?.toString()
        if (!ownerId || !conversationId) {
            return next(new AppError("something went wrong try again later", 500))
        }
        const response = await conversationServices.deleteConversationService(conversationId as string)
        res.status(200).json({ success:response, message:"conversation deleted successfully" })
    }),

    // updateConversation: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    //     const {  contactId, savedName } = req.body
    //     const ownerId = (req as any).user?._id?.toString()
    //     if (!ownerId || !contactId ) {
    //         throw next(new AppError("something went wrong try again later ", 500))
    //     }
    //     if(!savedName){
    //         throw next(new AppError("name can't be empty ",400))
    //     }
    //     const conversation = await conversationServices.updateConversationervice(ownerId, contactId, savedName)
    //     res.status(200).json({ success: true, data: conversation })
    // }),
}