import type { Request , Response , NextFunction } from "express";
import { AppError } from "../utils/errorHandler.js";

export const globalErrorHandler = (
    err : AppError , 
    req: Request,
    res: Response,
    next: NextFunction
)=>{
const statusCode = err.statusCode || 500 
const message = err.message || 'internal server error'

res.status(statusCode).json({statusCode:'error' , message: message , stack: process.env.NODE_ENV === "development" ? err.stack : undefined})
}