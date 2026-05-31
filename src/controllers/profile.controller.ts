import profileServices from "../services/profile.services.js";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler.js";
import { catchAsync } from "../utils/catchAsync.js";
import logger from "../utils/logger.js";

export const getProfileController = {

    getOwnerProfile: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const _id = (req as any).user._id

        if (!_id) {
            return next(new AppError("user id is required", 400))
        }
        const user = await profileServices.getOwnerProfileService(_id)
        res.status(200).json({
            success: true,
            user,
            message: "user fetched successfully"
        })

    }),
    getUserProfile: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const _id = req.params._id
        if (!_id) {
            return next(new AppError("user id is required", 400))
        }
        const user = await profileServices.getUserProfileService(_id as string)
        res.status(200).json({
            success: true,
            user,
            message: "user info fetched successfully"
        })
    }),
    updateProfile: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const _id = (req as any).user._id

        const { name, biography } = req.body
        const profilePics  = req.file?.path as any
        if (!_id) return next(new AppError("user id is required in the profile controller", 400))
        if (!name && !biography && !profilePics) return next(new AppError("Please provide at least one field to update", 400))
        logger.info(`Updating profile for user ID: ${_id} with name: ${name}, biography: ${biography}, profilePic: ${profilePics}`)
        const updatedUser = await profileServices.updateProfileService(_id, name, biography, profilePics)
        if (!updatedUser) return next(new AppError("failed to update profile", 500))
        res.status(200).json({
            success: true,
            user: updatedUser,
            filePath: profilePics
        })

    })
}