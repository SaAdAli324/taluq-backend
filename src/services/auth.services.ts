import { User } from "../models/user.model.js";
import { AppError } from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import crypto from "crypto";
import { emailServices } from "./email.services.js";

export const authServices = {

    async loginService(email: string, password: string) {
        const user = await User.findOne({ email })

        if (!user || !(await bcrypt.compare(password, user.password!))) {
            throw new AppError("invalid email or password", 401)
        }

        if (!user.isVerified) {
            throw new AppError("Please verify your email address to log in", 403)
        }

        const { password: _, ...userObj } = user.toObject()

        const token = generateToken(user._id.toString())

        return { token, user: userObj }
    },

    async signUpService(name: string, email: string, password: string, profilePic?: string) {
        const existingUser = await User.findOne({ email })
        const existingUserName = await User.findOne({ name })

        if (existingUser || existingUserName) {
            throw new AppError("User already exists with this email or name", 400)
        }

        const hashedPass = await bcrypt.hash(password, 10)

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = new User({
            name,
            email,
            password: hashedPass,
            profilePic,
            isVerified: false,
            verificationToken,
            verificationTokenExpires
        })

        await newUser.save()

        // Send email asynchronously (don't block the request response)
        emailServices.sendVerificationEmail(email, verificationToken).catch((err) => {
            console.error("Failed to send verification email during signup:", err);
        });

        const { password: _, ...userObj } = newUser.toObject()

        return { user: userObj }
    },

    async verifyEmailService(token: string) {
        if (!token) {
            throw new AppError("Token is required", 400);
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new AppError("Invalid or expired verification token", 400);
        }

        user.isVerified = true;
        user.verificationToken = null as any;
        user.verificationTokenExpires = null as any;
        await user.save();

        return { success: true };
    },

    async forgotPasswordService(email: string) {
        if (!email) {
            throw new AppError("Email is required", 400);
        }

        const user = await User.findOne({ email });

        // For security, don't reveal if a user exists or not.
        if (!user) {
            return { message: "If that email is registered, we have sent a reset link." };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        // Send reset email
        emailServices.sendPasswordResetEmail(email, resetToken).catch((err) => {
            console.error("Failed to send password reset email:", err);
        });

        return { message: "If that email is registered, we have sent a reset link." };
    },

    async resetPasswordService(token: string, password: string) {
        if (!token || !password) {
            throw new AppError("Token and password are required", 400);
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new AppError("Invalid or expired reset token", 400);
        }

        // Update password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null as any;
        user.resetPasswordExpires = null as any;
        await user.save();

        return { success: true };
    }

}
