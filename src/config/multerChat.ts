import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary-v2";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || ""
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary as any,
    params: {
        folder: "chatAttachments",
        resource_type: "auto", // Allows image, video, and raw files (PDFs, docs, zip, etc.)
    } as any
});

const uploadChatAttachment = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

export default uploadChatAttachment;
