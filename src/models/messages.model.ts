import mongoose from "mongoose";
import type { TypeMessage } from "../types/messageType.js";
const messageSchema = new mongoose.Schema<TypeMessage>({
    conversationId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Conversation'
    },
    type:{
        type:String,
        enum:["text","image","video","file"],
        default:"text"
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    text:{
        type:String,
        required:true
    },
    seen:{
        type:Boolean,
        default:false
    },
    deleted:{
        type:Boolean,
        default:false
    },
    isdelivered:{
        type:Boolean,
        default:false
    },
    issend:{
        type:Boolean,
        default:false
    },
    isEdited:{
        type:Boolean,
        default:false
    },
    
    
}, {timestamps:true})

export const Messages = mongoose.model("Messages", messageSchema)