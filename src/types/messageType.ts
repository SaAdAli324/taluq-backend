import mongoose from "mongoose";
export interface TypeMessage {
    conversationId: string | null | undefined | mongoose.Types.ObjectId;
    type: "text" | "image" | "video" | "file" | null | undefined;
    sender: string | null | undefined | mongoose.Types.ObjectId;
    receiver: string | null | undefined | mongoose.Types.ObjectId;
    text: string | null | undefined;
    seen: boolean | null | undefined;
    createdAt: Date | null | undefined;
    updatedAt: Date | null | undefined;
    deleted: boolean | null | undefined;
    isdelivered: boolean | null | undefined;
    issend: boolean | null | undefined;
    isEdited: boolean | null | undefined;
}       