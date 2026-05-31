import { User } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHandler.js";
import type { Request, Response, NextFunction } from "express";

export const searchUser = catchAsync(async(req:Request , res:Response , next:NextFunction) => {
    const {_id}= req.body
    
    if(!_id){
        throw next(new AppError("no user found", 404))
    }
  const users = await User.find({
            $or: [
                { name: { $regex: _id, $options: "i" } }, // 'i' makes it case-insensitive
                { email: { $regex: _id, $options: "i" } }
            ]
        })
        .select("-password") // NEVER send passwords back
        .limit(10);
    if(!users){
        throw next(new AppError("no user found", 404))
    }
    res.status(200).json({success:true , data:users})
})