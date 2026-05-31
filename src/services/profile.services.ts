import { User } from "../models/user.model.js";

import { AppError } from "../utils/errorHandler.js";
import logger from "../utils/logger.js";

const profileServices = {

    async getOwnerProfileService(ownerId: string) {
        logger.info(`Fetching profile for user ID: ${ownerId}`);
        const user = await User.findById( ownerId ).select("-password")
        if (!user) {
            throw new AppError("user not found", 404)
        }
        return user

    },
    async getUserProfileService(userId: string) {
        logger.info("this is th user id ", userId)
        const user = await User.findById( userId ).select("-password")
        logger.info(`Fetched profile for user ID: ${userId}`, user)
        if (!user) {
            throw new AppError("user not found", 404)
        }
        return user
    },
    async updateProfileService(userId:string|null , name:string|null , biography:string|null , profilePic:string|null){
        if (!userId){
             throw new AppError("user id is required in profile services",400)
        }
        const user = await User.findById(userId)
        if (!user){
            throw new AppError("user not found in profile services ",404)
        }
        if (name) user.name = name
        if (biography) user.biography = biography
        if (profilePic) user.profilePic = profilePic
        await user.save()
        return user
    }
}


export default profileServices