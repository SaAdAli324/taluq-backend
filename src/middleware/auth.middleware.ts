import Jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

import { User } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHandler.js";

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let token

    if (req.cookies.token) {
        token = req.cookies.token

    }
    if (!token) {
        return next(new AppError("login first", 401))
    }
    const decoded = Jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string }

    const currentUser = await User.findById(decoded._id)

    if (!currentUser) {
        return next(new AppError("User not found", 404))
    }
    (req as any).user = currentUser
    next()
}

)
