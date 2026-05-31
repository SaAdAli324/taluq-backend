
import type { LogInType } from "../types/userType.js";
import type { NextFunction, Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/errorHandler.js";

import { authServices } from "../services/auth.services.js";
import type { TypeUser } from "../types/userType.js";
import { tokenCookie } from "../utils/setTokenCookie.js";

export const authController = {

  login: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LogInType

    if (!email || !password) {
      return next(new AppError("Please enter all the fields", 400))
    }

    const { user, token } = await authServices.loginService(email, password)

    tokenCookie.setCookie(res, token)

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      user
    })
  }),

  signUp: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body as TypeUser

    if (!name || !email || !password) {
      return next(new AppError("All fields are required", 400))
    }

    const { user } = await authServices.signUpService(name, email, password)

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      success: true,
      user
    })
  }),

  verifyEmail: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body
    if (!token) {
      return next(new AppError("Verification token is required", 400))
    }

    await authServices.verifyEmailService(token)

    res.status(200).json({
      message: "Email verified successfully! You can now log in.",
      success: true
    })
  }),

  forgotPassword: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body
    if (!email) {
      return next(new AppError("Email is required", 400))
    }

    const result = await authServices.forgotPasswordService(email)

    res.status(200).json({
      message: result.message,
      success: true
    })
  }),

  resetPassword: catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body
    if (!token || !password) {
      return next(new AppError("Token and password are required", 400))
    }

    await authServices.resetPasswordService(token, password)

    res.status(200).json({
      message: "Password reset successfully! You can now log in.",
      success: true
    })
  })

}


