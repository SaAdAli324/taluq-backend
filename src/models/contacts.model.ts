import mongoose from "mongoose";
import type { Icontacts } from "../types/contactType.js";


const UserContacts = new mongoose.Schema<Icontacts>({

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    savedName: {
        type: String,
        default: "",
    }


}, { timestamps: true })

    UserContacts.index({ownerId:1})

    UserContacts.index( {ownerId:1,contactId:1 } , {unique:true})


export const Contacts = mongoose.model("Contacts", UserContacts)