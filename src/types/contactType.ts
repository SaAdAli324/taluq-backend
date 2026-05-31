import mongoose from "mongoose";
export interface Icontacts {
    ownerId: mongoose.Types.ObjectId;
    contactId: mongoose.Types.ObjectId;
    savedName: string;

}