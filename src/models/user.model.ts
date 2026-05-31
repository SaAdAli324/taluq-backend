import mongoose, { Document } from "mongoose";
import { type TypeUser } from "../types/userType.js";


export interface TypeSignUp extends TypeUser, Document { }
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
    },
    profilePic: {
       type:String,
       default:"https://static.vecteezy.com/system/resources/previews/036/280/651/non_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"

    },  
    isOnline: {
       type:Boolean,
       default:false
    },
    biography: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpires: {
        type: Date,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
}, { timestamps: true })

export const User = mongoose.model("User", userSchema)


