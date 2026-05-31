import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getProfileController } from "../controllers/profile.controller.js";
import uploadProfilePic from "../config/multer.js";
const route = express.Router()

route.get("/profile" , protect, getProfileController.getOwnerProfile )
route.get("/profile/user/:_id", protect, getProfileController.getUserProfile)
route.put("/profile/user/update" ,protect,uploadProfilePic.single("profilePics"), getProfileController.updateProfile)
export default route